import { ageInYear } from "./age";

/** Minimum age at which Social Security benefit inputs are shown (product rule). */
export const SOCIAL_SECURITY_INPUT_MIN_AGE = 59;

export function memberIsSocialSecurityEligibleAge(
  birthday: string,
  calendarYear: number
): boolean {
  return ageInYear(birthday, calendarYear) >= SOCIAL_SECURITY_INPUT_MIN_AGE;
}

export function eraIncludesSocialSecurityEligibleYearForMember(
  birthday: string,
  eraStartYear: number,
  eraEndYear: number
): boolean {
  for (let y = eraStartYear; y <= eraEndYear; y++) {
    if (memberIsSocialSecurityEligibleAge(birthday, y)) {
      return true;
    }
  }
  return false;
}

/**
 * True if the era spans at least one year before eligibility and one year at/after eligibility.
 */
export function memberCrossesSocialSecurityEligibilityDuringEra(
  birthday: string,
  eraStartYear: number,
  eraEndYear: number
): boolean {
  let hasUnder = false;
  let hasEligible = false;
  for (let y = eraStartYear; y <= eraEndYear; y++) {
    if (memberIsSocialSecurityEligibleAge(birthday, y)) {
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
