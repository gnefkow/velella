import { ageInYear } from "./age";

/** Minimum age at which pre-tax distributions become a prominent income input. */
export const PRE_TAX_DISTRIBUTION_MIN_AGE = 55;

export function memberIsPreTaxDistributionEligibleAge(
  birthday: string,
  calendarYear: number
): boolean {
  return ageInYear(birthday, calendarYear) >= PRE_TAX_DISTRIBUTION_MIN_AGE;
}

export function eraIncludesPreTaxDistributionEligibleYearForMember(
  birthday: string,
  eraStartYear: number,
  eraEndYear: number
): boolean {
  for (let y = eraStartYear; y <= eraEndYear; y++) {
    if (memberIsPreTaxDistributionEligibleAge(birthday, y)) {
      return true;
    }
  }
  return false;
}

/**
 * True if the era spans at least one year before the threshold and one at/after it.
 */
export function memberCrossesPreTaxDistributionEligibilityDuringEra(
  birthday: string,
  eraStartYear: number,
  eraEndYear: number
): boolean {
  let hasUnder = false;
  let hasEligible = false;
  for (let y = eraStartYear; y <= eraEndYear; y++) {
    if (memberIsPreTaxDistributionEligibleAge(birthday, y)) {
      hasEligible = true;
    } else {
      hasUnder = true;
    }
    if (hasUnder && hasEligible) {
      return true;
    }
  }
  return false;
}
