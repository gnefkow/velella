import { readFileSync } from "node:fs";
import yaml from "js-yaml";
import { describe, expect, it } from "vitest";
import {
  normalizeTaxReferenceDataYaml,
  toTaxEstimatorReferenceData,
  type TaxReferenceDataYaml,
} from "./taxReferenceDataService";

function loadRawTaxReferenceDataYaml(): TaxReferenceDataYaml {
  const path = new URL("../../data/tax-reference-data.yaml", import.meta.url);
  const contents = readFileSync(path, "utf-8");
  return yaml.load(contents) as TaxReferenceDataYaml;
}

describe("taxReferenceDataService", () => {
  it("normalizes the checked-in tax reference data yaml", () => {
    const normalized = normalizeTaxReferenceDataYaml(loadRawTaxReferenceDataYaml());

    expect(normalized.metadata.taxYear).toBe(2026);
    expect(normalized.standardDeduction.valuesByFilingStatus.single).toBe(16_100);
    expect(
      normalized.standardDeduction.valuesByFilingStatus["married-filing-jointly"]
    ).toBe(32_200);
    expect(
      normalized.preferentialIncomeBrackets.valuesByFilingStatus.single[0]
    ).toEqual({
      rate: 0,
      lowerBound: 0,
      upperBound: 49_450,
    });
    expect(
      normalized.informationalThresholds.workplacePlanContributionLimits
        .employeeElectiveDeferralLimit
    ).toBe(24_500);
    expect(
      normalized.informationalThresholds.hsaContributionLimits.family
    ).toBe(8_750);
    expect(normalized.childTaxCredit.source.url).toContain("irs.gov");
  });

  it("builds the estimator-focused subset from the full dataset", () => {
    const normalized = normalizeTaxReferenceDataYaml(loadRawTaxReferenceDataYaml());
    const estimatorData = toTaxEstimatorReferenceData(normalized);

    expect(estimatorData.supportedFilingStatuses).toEqual([
      "single",
      "married-filing-jointly",
      "married-filing-separately",
    ]);
    expect(
      estimatorData.ordinaryIncomeBracketsByFilingStatus["married-filing-jointly"]
        .length
    ).toBe(7);
    expect(estimatorData.socialSecurityTaxation.taxableBenefitRates).toEqual([
      0,
      0.5,
      0.85,
    ]);
    expect(
      estimatorData.childTaxCredit.phaseoutStartsByFilingStatus[
        "married-filing-jointly"
      ]
    ).toBe(400_000);
  });
});
