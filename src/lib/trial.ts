const DEFAULT_TRIAL_PERIOD_DAYS = 14;

/** Default trial length in days. Prefer `getTrialPeriodDays()` so env overrides apply. */
export const TRIAL_PERIOD_DAYS = DEFAULT_TRIAL_PERIOD_DAYS;

export function getTrialPeriodDays(): number {
  const raw = process.env.TRIAL_PERIOD_DAYS?.trim();
  if (!raw) return DEFAULT_TRIAL_PERIOD_DAYS;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TRIAL_PERIOD_DAYS;
  }
  return Math.floor(parsed);
}
