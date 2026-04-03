import { describe, expect, it } from "vitest";
import {
  eraIncludesSocialSecurityEligibleYearForMember,
  memberCrossesSocialSecurityEligibilityDuringEra,
  memberIsSocialSecurityEligibleAge,
  SOCIAL_SECURITY_INPUT_MIN_AGE,
} from "./socialSecurityEligibility";

describe("socialSecurityEligibility", () => {
  const birthday1967 = "06/15/1967"; // age 59 in 2026 (2026-1967=59)

  it("uses 59 as the eligibility threshold constant", () => {
    expect(SOCIAL_SECURITY_INPUT_MIN_AGE).toBe(59);
  });

  it("treats exact age 59 in a calendar year as eligible", () => {
    expect(memberIsSocialSecurityEligibleAge(birthday1967, 2026)).toBe(true);
  });

  it("treats age 58 in a calendar year as not eligible", () => {
    expect(memberIsSocialSecurityEligibleAge(birthday1967, 2025)).toBe(false);
  });

  it("detects when an era includes at least one eligible year", () => {
    expect(
      eraIncludesSocialSecurityEligibleYearForMember(birthday1967, 2024, 2026)
    ).toBe(true);
    expect(
      eraIncludesSocialSecurityEligibleYearForMember(birthday1967, 2024, 2025)
    ).toBe(false);
  });

  it("detects crossing from under 59 to 59+ within an era", () => {
    expect(
      memberCrossesSocialSecurityEligibilityDuringEra(
        birthday1967,
        2024,
        2026
      )
    ).toBe(true);
    expect(
      memberCrossesSocialSecurityEligibilityDuringEra(
        birthday1967,
        2026,
        2030
      )
    ).toBe(false);
    expect(
      memberCrossesSocialSecurityEligibilityDuringEra(
        birthday1967,
        2024,
        2025
      )
    ).toBe(false);
  });
});
