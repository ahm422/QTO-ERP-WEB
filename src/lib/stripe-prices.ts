export type BillingInterval = "monthly" | "yearly";

export type StripePriceIds = {
  monthly: string | null;
  yearly: string | null;
};

const ENV_KEYS: Record<string, { monthly: string; yearly: string }> = {
  starter: {
    monthly: "STRIPE_PRICE_STARTER_MONTHLY",
    yearly: "STRIPE_PRICE_STARTER_YEARLY",
  },
  growth: {
    monthly: "STRIPE_PRICE_GROWTH_MONTHLY",
    yearly: "STRIPE_PRICE_GROWTH_YEARLY",
  },
};

function readEnvPrice(envVar: string): string | null {
  const value = process.env[envVar]?.trim();
  if (!value) return null;
  return isStripePriceId(value) ? value : null;
}

export function isStripePriceId(id: string): boolean {
  return id.startsWith("price_");
}

/** Ignore product IDs (prod_...) mistakenly stored as prices. */
export function normalizeStoredPriceId(id: string | null | undefined): string | null {
  if (!id) return null;
  return isStripePriceId(id) ? id : null;
}

export function validateStripePriceId(id: string, label: string): string | null {
  if (isStripePriceId(id)) return null;
  if (id.startsWith("prod_")) {
    return `${label} must be a Price ID (price_...), not a Product ID (prod_...). In Stripe Dashboard, open the product → click the price → copy the price ID.`;
  }
  return `${label} must start with price_.`;
}

/** Price IDs from env (used by seed and checkout fallback). */
export function stripePriceIdsFromEnv(slug: string): StripePriceIds {
  const keys = ENV_KEYS[slug];
  if (!keys) {
    return { monthly: null, yearly: null };
  }
  return {
    monthly: readEnvPrice(keys.monthly),
    yearly: readEnvPrice(keys.yearly),
  };
}

/** Valid DB price first, then valid env price. Skips invalid prod_... values. */
export function resolveStripePriceId(
  slug: string,
  interval: BillingInterval,
  fromDb: StripePriceIds,
): string | null {
  const dbMonthly = normalizeStoredPriceId(fromDb.monthly);
  const dbYearly = normalizeStoredPriceId(fromDb.yearly);
  const dbId = interval === "yearly" ? dbYearly : dbMonthly;
  if (dbId) return dbId;

  const fromEnv = stripePriceIdsFromEnv(slug);
  return interval === "yearly" ? fromEnv.yearly : fromEnv.monthly;
}

/** Raw env value (for validation messages when misconfigured). */
export function rawEnvPriceId(
  slug: string,
  interval: BillingInterval,
): string | null {
  const keys = ENV_KEYS[slug];
  if (!keys) return null;
  const envVar = interval === "yearly" ? keys.yearly : keys.monthly;
  return process.env[envVar]?.trim() || null;
}
