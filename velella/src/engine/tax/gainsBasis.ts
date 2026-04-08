/**
 * Fraction of realized short/long-term amounts treated as taxable gain for the
 * federal estimator (remainder treated as basis). Velella modeling assumption,
 * not tax-law reference data.
 * Later we will enable the user to manipulate this.
 */
export const REALIZED_GAIN_TAXABLE_FRACTION = 0.5;

/** Shown under realized gain fields in Year and Era panes. */
export const REALIZED_GAIN_BASIS_UI_NOTE = "Assumes 50% is basis";

export function taxableGainPortionFromRealizedAmount(
  realizedAmount: number
): number {
  const clamped = Math.max(0, realizedAmount);
  return clamped * REALIZED_GAIN_TAXABLE_FRACTION;
}
