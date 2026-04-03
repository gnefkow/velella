import { describe, expect, it } from "vitest";
import { yamlToScenario, scenarioToYaml } from "./scenarioService";

describe("investment-breakdown YAML", () => {
  it("migrates legacy traditional-retirement into preTax401kContribution", () => {
    const s = yamlToScenario({
      "scenario-info": { "year-start": 2026, "year-end": 2026 },
      "household-members": [{ id: "p1", "income-earner": true }],
      years: [
        {
          year: 2026,
          "modify-investment-details": true,
          "investment-breakdown": {
            "traditional-retirement": 12_500,
            "roth-retirement": 1_000,
            "taxable-investments": 2_000,
          },
        },
      ],
    });
    expect(s.years[0]?.investmentBreakdown.preTax401kContribution).toBe(12_500);
    expect(s.years[0]?.investmentBreakdown.preTaxIraContribution).toBe(0);
    expect(s.years[0]?.investmentBreakdown.hsaContribution).toBe(0);
    expect(s.years[0]?.investmentBreakdown.rothRetirement).toBe(1_000);
    expect(s.years[0]?.investmentBreakdown.taxableInvestments).toBe(2_000);
  });

  it("round-trips pre-tax contribution keys and does not emit traditional-retirement", () => {
    const s = yamlToScenario({
      "scenario-info": { "year-start": 2026, "year-end": 2026 },
      "household-members": [{ id: "p1", "income-earner": true }],
      years: [
        {
          year: 2026,
          "modify-investment-details": true,
          "investment-breakdown": {
            "pre-tax-401k-contribution": 18_000,
            "pre-tax-ira-contribution": 6_000,
            "hsa-contribution": 4_150,
            "roth-retirement": 500,
            "taxable-investments": 700,
          },
        },
      ],
    });
    const yaml = scenarioToYaml(s);
    const row = yaml.years?.[0];
    expect(row?.["investment-breakdown"]?.["pre-tax-401k-contribution"]).toBe(
      18_000
    );
    expect(row?.["investment-breakdown"]?.["pre-tax-ira-contribution"]).toBe(
      6_000
    );
    expect(row?.["investment-breakdown"]?.["hsa-contribution"]).toBe(4_150);
    expect(row?.["investment-breakdown"]?.["traditional-retirement"]).toBe(
      undefined
    );
    const roundTrip = yamlToScenario(yaml);
    expect(roundTrip.years[0]?.investmentBreakdown.preTax401kContribution).toBe(
      18_000
    );
    expect(roundTrip.years[0]?.investmentBreakdown.preTaxIraContribution).toBe(
      6_000
    );
    expect(roundTrip.years[0]?.investmentBreakdown.hsaContribution).toBe(4_150);
  });

  it("migrates traditional-retirement in overridden-fields to pre-tax-401k-contribution", () => {
    const s = yamlToScenario({
      "scenario-info": { "year-start": 2026, "year-end": 2026 },
      "household-members": [{ id: "p1", "income-earner": true }],
      years: [
        {
          year: 2026,
          "era-metadata": {
            "era-id": "e1",
            "overridden-fields": ["traditional-retirement"],
          },
        },
      ],
    });
    expect(s.years[0]?.eraMetadata?.overriddenFields).toEqual([
      "pre-tax-401k-contribution",
    ]);
  });
});
