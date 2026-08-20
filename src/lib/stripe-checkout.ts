import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { getPublishedPricingPlanBySlug } from "@/lib/content-db";
import { getDb } from "@/lib/db";
import { pricingPlans } from "@/db/schema";
import { getStripe } from "@/lib/stripe";
import {
  type BillingInterval,
  isStripePriceId,
  normalizeStoredPriceId,
  rawEnvPriceId,
  resolveStripePriceId,
  stripePriceIdsFromEnv,
  validateStripePriceId,
} from "@/lib/stripe-prices";
import { getTrialPeriodDays } from "@/lib/trial";

export type CheckoutPlanSlug = "starter" | "growth" | "enterprise";

export type CreateCheckoutSessionInput = {
  planSlug: CheckoutPlanSlug;
  interval: BillingInterval;
  customerEmail?: string;
  trial?: boolean;
  logLabel: string;
};

export type CreateCheckoutSessionResult =
  | { ok: true; url: string }
  | { ok: false; error: string; status: number };

export function getAppBaseUrl(): string | null {
  const url = process.env.AUTH_URL?.trim();
  if (!url) return null;
  return url.replace(/\/$/, "");
}

export async function createSubscriptionCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<CreateCheckoutSessionResult> {
  const { planSlug, interval, customerEmail, trial = false, logLabel } = input;

  const baseUrl = getAppBaseUrl();
  if (!baseUrl) {
    console.error(`[${logLabel}] AUTH_URL is not configured`);
    return { ok: false, error: "Checkout is not configured.", status: 500 };
  }

  if (planSlug === "enterprise") {
    return {
      ok: false,
      error: "Plan not available for purchase.",
      status: 400,
    };
  }

  try {
    const plan = await getPublishedPricingPlanBySlug(planSlug);
    if (!plan) {
      return { ok: false, error: "Plan not found.", status: 404 };
    }

    const envLabel = `STRIPE_PRICE_${planSlug.toUpperCase()}_${interval.toUpperCase()}`;
    const rawEnv = rawEnvPriceId(planSlug, interval);
    if (rawEnv && !isStripePriceId(rawEnv)) {
      const envError = validateStripePriceId(rawEnv, envLabel);
      if (envError) return { ok: false, error: envError, status: 400 };
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
      return {
        ok: false,
        error:
          "Checkout is not configured for this plan. Set STRIPE_PRICE_* to price_... IDs in .env (see .env.example), then restart the dev server.",
        status: 400,
      };
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
      await (await getDb())
        .update(pricingPlans)
        .set(persist)
        .where(eq(pricingPlans.id, plan.id));
    }

    let stripe;
    try {
      stripe = getStripe();
    } catch {
      return {
        ok: false,
        error: "Stripe is not configured. Set STRIPE_SECRET_KEY in .env.",
        status: 503,
      };
    }

    const successUrl = trial
      ? `${baseUrl}/pricing/trial/success?session_id={CHECKOUT_SESSION_ID}`
      : `${baseUrl}/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}`;

    const metadata: Stripe.MetadataParam = {
      planSlug,
      interval,
      ...(trial ? { trial: "true" } : {}),
    };

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
      metadata,
      ...(trial
        ? {
            subscription_data: {
              trial_period_days: getTrialPeriodDays(),
              metadata,
            },
          }
        : {}),
      ...(customerEmail ? { customer_email: customerEmail } : {}),
    });

    if (!session.url) {
      console.error(`[${logLabel}] Stripe session missing url`);
      return { ok: false, error: "Could not start checkout.", status: 500 };
    }

    return { ok: true, url: session.url };
  } catch (err) {
    console.error(`[${logLabel}] Error:`, err);
    if (err instanceof Stripe.errors.StripeError) {
      return { ok: false, error: err.message, status: 400 };
    }
    return {
      ok: false,
      error: "Something went wrong. Please try again.",
      status: 500,
    };
  }
}
