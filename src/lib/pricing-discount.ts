/**
 * yearlyPrice is the monthly rate when billed annually (not an annual total).
 * Returns null when a badge would be misleading (custom, missing, or no savings).
 */
export function annualDiscountPercent(
  monthlyPrice: number | null | undefined,
  yearlyPrice: number | null | undefined,
): number | null {
  if (
    typeof monthlyPrice !== "number" ||
    typeof yearlyPrice !== "number" ||
    !Number.isFinite(monthlyPrice) ||
    !Number.isFinite(yearlyPrice) ||
    monthlyPrice <= 0 ||
    yearlyPrice <= 0 ||
    yearlyPrice >= monthlyPrice
  ) {
    return null;
  }
  return Math.round((1 - yearlyPrice / monthlyPrice) * 100);
}
