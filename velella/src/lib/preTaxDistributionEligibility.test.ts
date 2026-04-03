import { describe, expect, it } from "vitest";
import {
  eraIncludesPreTaxDistributionEligibleYearForMember,
  memberCrossesPreTaxDistributionEligibilityDuringEra,
  memberIsPreTaxDistributionEligibleAge,
  PRE_TAX_DISTRIBUTION_MIN_AGE,
} from "./preTaxDistributionEligibility";

describe("preTaxDistributionEligibility", () => {
  const birthday1971 = "06/15/1971"; // age 55 in 2026

  it("uses 55 as the eligibility threshold constant", () => {
    expect(PRE_TAX_DISTRIBUTION_MIN_AGE).toBe(55);
  });

  it("treats exact age 55 in a calendar year as eligible", () => {
    expect(memberIsPreTaxDistributionEligibleAge(birthday1971, 2026)).toBe(
      true
    );
  });

  it("treats age 54 in a calendar year as not eligible", () => {
    expect(memberIsPreTaxDistributionEligibleAge(birthday1971, 2025)).toBe(
      false
    );
  });

  it("detects when an era includes at least one eligible year", () => {
    expect(
      eraIncludesPreTaxDistributionEligibleYearForMember(
        birthday1971,
        2024,
        2026
      )
    ).toBe(true);
    expect(
      eraIncludesPreTaxDistributionEligibleYearForMember(
        birthday1971,
        2024,
        2025
      )
    ).toBe(false);
  });

  it("detects crossing from under 55 to 55+ within an era", () => {
    expect(
      memberCrossesPreTaxDistributionEligibilityDuringEra(
        birthday1971,
        2024,
        2026
      )
    ).toBe(true);
    expect(
      memberCrossesPreTaxDistributionEligibilityDuringEra(
        birthday1971,
        2026,
        2030
      )
    ).toBe(false);
    expect(
      memberCrossesPreTaxDistributionEligibilityDuringEra(
        birthday1971,
        2024,
        2025
      )
    ).toBe(false);
  });
});
