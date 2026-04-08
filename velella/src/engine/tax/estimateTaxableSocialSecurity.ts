import type { SocialSecurityThreshold } from "../../types/taxReferenceData";

/**
 * IRS-style taxable Social Security benefits (Publication 915 style), using
 * provisional income and filing-status thresholds from reference data.
 */
export function estimateTaxableSocialSecurityBenefits(
  grossBenefits: number,
  provisionalIncome: number,
  threshold: SocialSecurityThreshold
): number {
  if (grossBenefits <= 0) return 0;

  const b = threshold.baseAmount;
  const ab = threshold.adjustedBaseAmount;

  if (provisionalIncome <= b) {
    return 0;
  }

  if (provisionalIncome <= ab) {
    return Math.min(0.5 * grossBenefits, 0.5 * (provisionalIncome - b));
  }

  const lineA = Math.min(0.5 * grossBenefits, 0.5 * (ab - b));
  const lineB = 0.85 * (provisionalIncome - ab) + lineA;
  return Math.min(0.85 * grossBenefits, lineB);
}
