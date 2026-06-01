import Stripe from "stripe";

const globalForStripe = globalThis as unknown as {
  stripe: Stripe | undefined;
  stripeSecretKey: string | undefined;
};

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }

  if (globalForStripe.stripe && globalForStripe.stripeSecretKey === key) {
    return globalForStripe.stripe;
  }

  globalForStripe.stripeSecretKey = key;
  globalForStripe.stripe = new Stripe(key);
  return globalForStripe.stripe;
}
