import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { getPublishedPricingPlanBySlug } from "@/lib/content-db";
import { getPrisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import {
  isStripePriceId,
  normalizeStoredPriceId,
  rawEnvPriceId,
  resolveStripePriceId,
  stripePriceIdsFromEnv,
  validateStripePriceId,
} from "@/lib/stripe-prices";
import Stripe from "stripe";
import { pricingCheckoutSchema } from "@/lib/validations/pricing-checkout";

export const runtime = "nodejs";

function getAppBaseUrl(): string | null {
  const url = process.env.AUTH_URL?.trim();
  if (!url) return null;
  return url.replace(/\/$/, "");
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = pricingCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const baseUrl = getAppBaseUrl();
  if (!baseUrl) {
    console.error("[api/pricing/checkout] AUTH_URL is not configured");
    return jsonError("Checkout is not configured.", 500);
  }

  const { planSlug, interval, customerEmail } = parsed.data;

  if (planSlug === "enterprise") {
    return jsonError("Plan not available for purchase.", 400);
  }

  try {
    const plan = await getPublishedPricingPlanBySlug(planSlug);
    if (!plan) {
      return jsonError("Plan not found.", 404);
    }

    const envLabel = `STRIPE_PRICE_${planSlug.toUpperCase()}_${interval.toUpperCase()}`;
    const rawEnv = rawEnvPriceId(planSlug, interval);
    if (rawEnv && !isStripePriceId(rawEnv)) {
      const envError = validateStripePriceId(rawEnv, envLabel);
      if (envError) return jsonError(envError, 400);
    }

    const dbMonthly = plan.stripePriceIdMonthly;
    const dbYearly = plan.stripePriceIdYearly;
    const hadInvalidDbIds =
      (dbMonthly && !isStripePriceId(dbMonthly)) ||
      (dbYearly && !isStripePriceId(dbYearly));

    const priceId = resolveStripePriceId(planSlug, interval, {
      monthly: dbMonthly,
      yearly: dbYearly,
    });

    if (!priceId) {
      return jsonError(
        "Checkout is not configured for this plan. Set STRIPE_PRICE_* to price_... IDs in .env (see .env.example), then restart the dev server.",
        400,
      );
    }

    const fromEnv = stripePriceIdsFromEnv(planSlug);
    const persist: {
      stripePriceIdMonthly?: string | null;
      stripePriceIdYearly?: string | null;
    } = {};

    if (hadInvalidDbIds) {
      persist.stripePriceIdMonthly = normalizeStoredPriceId(dbMonthly);
      persist.stripePriceIdYearly = normalizeStoredPriceId(dbYearly);
    }
    if (!normalizeStoredPriceId(dbMonthly) && fromEnv.monthly) {
      persist.stripePriceIdMonthly = fromEnv.monthly;
    }
    if (!normalizeStoredPriceId(dbYearly) && fromEnv.yearly) {
      persist.stripePriceIdYearly = fromEnv.yearly;
    }
    if (Object.keys(persist).length > 0) {
      await getPrisma().pricingPlan.update({
        where: { id: plan.id },
        data: persist,
      });
    }

    let stripe;
    try {
      stripe = getStripe();
    } catch {
      return jsonError(
        "Stripe is not configured. Set STRIPE_SECRET_KEY in .env.",
        503,
      );
    }
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
      metadata: {
        planSlug,
        interval,
      },
      ...(customerEmail ? { customer_email: customerEmail } : {}),
    });

    if (!session.url) {
      console.error("[api/pricing/checkout] Stripe session missing url");
      return jsonError("Could not start checkout.", 500);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[api/pricing/checkout] Error:", err);
    if (err instanceof Stripe.errors.StripeError) {
      return jsonError(err.message, 400);
    }
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
