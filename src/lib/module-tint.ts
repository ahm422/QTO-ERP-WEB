/**
 * Module accent tint classes for CardIcon / chips — token-only utilities.
 */
const MODULE_TINTS = [
  { match: /hr|attendance|payroll|workforce|people/i, className: 'bg-module-hr-bg text-module-hr' },
  { match: /inventory|fleet|warehouse|asset/i, className: 'bg-module-inventory-bg text-module-inventory' },
  { match: /crm|sales|pipeline|lead/i, className: 'bg-module-crm-bg text-module-crm' },
  { match: /payroll|pay/i, className: 'bg-module-payroll-bg text-module-payroll' },
  { match: /mfg|manufactur|production/i, className: 'bg-module-mfg-bg text-module-mfg' },
  { match: /account|finance|ledger/i, className: 'bg-module-accounting-bg text-module-accounting' },
] as const;

const FALLBACK = 'bg-accent/10 text-accent';

export function getModuleTintClass(slug: string, iconKey?: string): string {
  const haystack = `${slug} ${iconKey ?? ''}`;
  for (const entry of MODULE_TINTS) {
    if (entry.match.test(haystack)) return entry.className;
  }
  return FALLBACK;
}
