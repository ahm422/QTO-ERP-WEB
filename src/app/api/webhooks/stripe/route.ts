import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { SubscriptionAdminNotificationEmail } from "@/emails/subscription-admin-notification";
import { jsonError } from "@/lib/api-errors";
import {
  getAdminNotificationEmail,
  logEmailResults,
  sendEmail,
} from "@/lib/email";
import { getDb } from "@/lib/db";
import { subscriptions } from "@/db/schema";
import { getStripe } from "@/lib/stripe";


export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    console.error("[api/webhooks/stripe] STRIPE_WEBHOOK_SECRET is not configured");
    return jsonError("Webhook not configured.", 500);
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return jsonError("Missing stripe-signature header.", 400);
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
    );
  } catch (err) {
    console.error("[api/webhooks/stripe] Signature verification failed:", err);
    return jsonError("Invalid signature.", 400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      await handleCheckoutSessionCompleted(session);
    } catch (err) {
      console.error("[api/webhooks/stripe] Handler error:", err);
      return jsonError("Webhook handler failed.", 500);
    }
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
) {
  const planSlug = session.metadata?.planSlug;
  const interval = session.metadata?.interval;

  if (!planSlug || !interval) {
    console.error(
      "[api/webhooks/stripe] Missing metadata on session",
      session.id,
    );
    return;
  }

  const customerEmail =
    session.customer_email ??
    session.customer_details?.email ??
    "";

  const stripeCustomerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id;

  if (!stripeCustomerId || !customerEmail) {
    console.error(
      "[api/webhooks/stripe] Missing customer on session",
      session.id,
    );
    return;
  }

  const stripeSubscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;

  const [existing] = await (await getDb())
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeCheckoutSessionId, session.id))
    .limit(1);

  if (existing) {
    return;
  }

  await (await getDb()).insert(subscriptions).values({
    stripeCustomerId,
    stripeSubscriptionId,
    stripeCheckoutSessionId: session.id,
    customerEmail,
    planSlug,
    billingInterval: interval,
    status: "active",
  });

  const adminEmail = getAdminNotificationEmail();
  if (adminEmail) {
    const emailResults = await Promise.allSettled([
      sendEmail({
        to: adminEmail,
        subject: `New subscription: ${planSlug} (${interval})`,
        react: SubscriptionAdminNotificationEmail({
          planSlug,
          billingInterval: interval,
          customerEmail,
          stripeCheckoutSessionId: session.id,
          stripeCustomerId,
          stripeSubscriptionId,
        }),
      }),
    ]);
    await logEmailResults("stripe-checkout", emailResults);
  }
}
