import { describe, expect, it } from "vitest";
import type { Scenario } from "../types/scenario";
import { buildDefaultEraFacts } from "../lib/eraFacts";
import { buildDefaultYearInput } from "../lib/yearFacts";
import { scenarioToYaml, yamlToScenario } from "./scenarioService";

describe("social-security-benefits YAML round-trip", () => {
  it("preserves per-earner maps on years and era-facts", () => {
    const scenario: Scenario = {
      scenarioInfo: {
        scenarioTitle: "T",
        scenarioDescription: "",
        yearStart: 2026,
        yearEnd: 2026,
      },
      assumptions: {
        inflationRate: 0.03,
        initialPortfolio: 1,
        marketReturn: 0.06,
        safeWithdrawalRate: 0.04,
      },
      householdMembers: [
        {
          id: "p1",
          nickname: "Pat",
          birthday: "01/01/1960",
          incomeEarner: true,
        },
      ],
      years: [
        buildDefaultYearInput(2026, ["p1"], {
          socialSecurityBenefits: { p1: 42_000 },
          misc: { rothConversions: 7_500 },
          otherIncome: {
            preTaxDistributions: 12_000,
            rothDistributions: 5_000,
            qualifiedDividends: 1_000,
            ordinaryDividends: 2_000,
            interestIncome: 0,
            longTermCapitalGains: 0,
            shortTermCapitalGains: 0,
          },
        }),
      ],
      eras: [
        {
          id: "e1",
          nickname: "E",
          description: "",
          startYear: 2026,
          endYear: 2026,
          eraFacts: buildDefaultEraFacts(["p1"], {
            socialSecurityBenefits: { p1: 99_000 },
            misc: { rothConversions: 12_000 },
            otherIncome: {
              preTaxDistributions: 34_000,
              rothDistributions: 8_000,
              qualifiedDividends: 4_000,
              ordinaryDividends: 5_000,
              interestIncome: 0,
              longTermCapitalGains: 0,
              shortTermCapitalGains: 0,
            },
          }),
        },
      ],
    };

    const yaml = scenarioToYaml(scenario);
    const roundTrip = yamlToScenario(yaml);

    expect(
      roundTrip.years[0]?.socialSecurityBenefits.p1
    ).toBe(42_000);
    expect(
      roundTrip.eras?.[0]?.eraFacts.socialSecurityBenefits.p1
    ).toBe(99_000);
    expect(roundTrip.years[0]?.misc.rothConversions).toBe(7_500);
    expect(roundTrip.eras?.[0]?.eraFacts.misc.rothConversions).toBe(12_000);
    expect(roundTrip.years[0]?.otherIncome.preTaxDistributions).toBe(12_000);
    expect(roundTrip.years[0]?.otherIncome.rothDistributions).toBe(5_000);
    expect(roundTrip.years[0]?.otherIncome.qualifiedDividends).toBe(1_000);
    expect(roundTrip.years[0]?.otherIncome.ordinaryDividends).toBe(2_000);
    expect(roundTrip.eras?.[0]?.eraFacts.otherIncome.preTaxDistributions).toBe(
      34_000
    );
    expect(roundTrip.eras?.[0]?.eraFacts.otherIncome.rothDistributions).toBe(
      8_000
    );
    expect(roundTrip.eras?.[0]?.eraFacts.otherIncome.qualifiedDividends).toBe(
      4_000
    );
    expect(roundTrip.eras?.[0]?.eraFacts.otherIncome.ordinaryDividends).toBe(
      5_000
    );
    expect(yaml.years?.[0]?.["social-security-benefits"]?.p1).toBe(42_000);
    expect(
      yaml.eras?.[0]?.["era-facts"]?.["social-security-benefits"]?.p1
    ).toBe(99_000);
    expect(yaml.years?.[0]?.misc?.["roth-conversions"]).toBe(7_500);
    expect(
      yaml.eras?.[0]?.["era-facts"]?.misc?.["roth-conversions"]
    ).toBe(12_000);
    expect(
      yaml.years?.[0]?.["other-income"]?.["pre-tax-distributions"]
    ).toBe(12_000);
    expect(yaml.years?.[0]?.["other-income"]?.["roth-distributions"]).toBe(
      5_000
    );
    expect(yaml.years?.[0]?.["other-income"]?.["qualified-dividends"]).toBe(
      1_000
    );
    expect(yaml.years?.[0]?.["other-income"]?.["ordinary-dividends"]).toBe(
      2_000
    );
    expect(
      yaml.eras?.[0]?.["era-facts"]?.["other-income"]?.["pre-tax-distributions"]
    ).toBe(34_000);
    expect(
      yaml.eras?.[0]?.["era-facts"]?.["other-income"]?.["roth-distributions"]
    ).toBe(8_000);
  });

  it("maps legacy dividend-income to ordinaryDividends on load", () => {
    const roundTrip = yamlToScenario({
      "scenario-info": {
        "year-start": 2026,
        "year-end": 2026,
      },
      "household-members": [{ id: "p1", "income-earner": true }],
      years: [
        {
          year: 2026,
          "other-income": {
            "dividend-income": 3_210,
          },
        },
      ],
      eras: [
        {
          id: "e1",
          "start-year": 2026,
          "end-year": 2026,
          "era-facts": {
            "other-income": {
              "dividend-income": 4_321,
            },
          },
        },
      ],
    });

    expect(roundTrip.years[0]?.otherIncome.qualifiedDividends).toBe(0);
    expect(roundTrip.years[0]?.otherIncome.ordinaryDividends).toBe(3_210);
    expect(roundTrip.eras?.[0]?.eraFacts.otherIncome.qualifiedDividends).toBe(0);
    expect(roundTrip.eras?.[0]?.eraFacts.otherIncome.ordinaryDividends).toBe(
      4_321
    );
  });
});
