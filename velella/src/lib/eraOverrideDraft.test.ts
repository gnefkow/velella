import { describe, expect, it } from "vitest";
import type { Scenario } from "../types/scenario";
import { buildEraOverrideFieldDescriptors } from "./eraOverrideFields";
import {
  applyEraOverrideDraftToScenario,
  buildEraOverrideDraftFromScenario,
  reconcileEraOverrideDraftForYears,
} from "./eraOverrideDraft";

function buildScenario(): Scenario {
  return {
    scenarioInfo: {
      scenarioTitle: "Test",
      scenarioDescription: "",
      yearStart: 2030,
      yearEnd: 2032,
    },
    assumptions: {
      inflationRate: 0.03,
      initialPortfolio: 1000000,
      marketReturn: 0.06,
      safeWithdrawalRate: 0.04,
    },
    householdMembers: [
      {
        id: "jack",
        nickname: "Jack",
        birthday: "01/01/1990",
        incomeEarner: true,
      },
    ],
    eras: [
      {
        id: "era-1",
        nickname: "On the hill",
        description: "",
        startYear: 2030,
        endYear: 2032,
        eraFacts: {
          wageIncome: { jack: 100000 },
          otherIncome: {
            dividendIncome: 0,
            interestIncome: 0,
            longTermCapitalGains: 0,
            shortTermCapitalGains: 0,
          },
          expenses: {
            householdExpenses: 0,
            taxes: 0,
            otherExpenses: 0,
          },
          modifyInvestmentDetails: false,
          investmentBreakdown: {
            traditionalRetirement: 0,
            rothRetirement: 0,
            taxableInvestments: 0,
          },
        },
      },
    ],
    years: [
      {
        year: 2030,
        wageIncome: { jack: 100000 },
        otherIncome: {
          dividendIncome: 0,
          interestIncome: 0,
          longTermCapitalGains: 0,
          shortTermCapitalGains: 0,
        },
        expenses: {
          householdExpenses: 0,
          taxes: 0,
          otherExpenses: 0,
        },
        modifyInvestmentDetails: false,
        investmentBreakdown: {
          traditionalRetirement: 0,
          rothRetirement: 0,
          taxableInvestments: 0,
        },
        eraMetadata: {
          eraId: "era-1",
          overriddenFields: [],
        },
      },
      {
        year: 2031,
        wageIncome: { jack: 125000 },
        otherIncome: {
          dividendIncome: 0,
          interestIncome: 0,
          longTermCapitalGains: 0,
          shortTermCapitalGains: 0,
        },
        expenses: {
          householdExpenses: 0,
          taxes: 0,
          otherExpenses: 0,
        },
        modifyInvestmentDetails: false,
        investmentBreakdown: {
          traditionalRetirement: 0,
          rothRetirement: 0,
          taxableInvestments: 0,
        },
        eraMetadata: {
          eraId: "era-1",
          overriddenFields: ["wage-income-jack"],
        },
      },
      {
        year: 2032,
        wageIncome: { jack: 100000 },
        otherIncome: {
          dividendIncome: 0,
          interestIncome: 0,
          longTermCapitalGains: 0,
          shortTermCapitalGains: 0,
        },
        expenses: {
          householdExpenses: 0,
          taxes: 0,
          otherExpenses: 0,
        },
        modifyInvestmentDetails: false,
        investmentBreakdown: {
          traditionalRetirement: 0,
          rothRetirement: 0,
          taxableInvestments: 0,
        },
        eraMetadata: {
          eraId: "era-1",
          overriddenFields: [],
        },
      },
    ],
  };
}

describe("era override draft helpers", () => {
  it("rehydrates existing year overrides from scenario years", () => {
    const scenario = buildScenario();
    const descriptors = buildEraOverrideFieldDescriptors(
      scenario.householdMembers
    );

    const draft = buildEraOverrideDraftFromScenario(
      scenario,
      "era-1",
      [2030, 2031, 2032],
      descriptors
    );

    expect(draft["wage-income-jack"]).toEqual({ 2031: 125000 });
  });

  it("carries edge override values into newly added range years", () => {
    const nextDraft = reconcileEraOverrideDraftForYears(
      {
        "wage-income-jack": {
          2030: 95000,
          2031: 110000,
        },
      },
      [2030, 2031],
      [2029, 2030, 2031, 2032]
    );

    expect(nextDraft["wage-income-jack"]).toEqual({
      2029: 95000,
      2030: 95000,
      2031: 110000,
      2032: 110000,
    });
  });

  it("applies draft override values to scenario years and metadata", () => {
    const scenario = buildScenario();
    const descriptors = buildEraOverrideFieldDescriptors(
      scenario.householdMembers
    );

    const updated = applyEraOverrideDraftToScenario(
      scenario,
      "era-1",
      {
        "wage-income-jack": {
          2030: 100000,
          2031: 130000,
          2032: 140000,
        },
      },
      descriptors
    );

    expect(updated.years.find((year) => year.year === 2031)?.wageIncome.jack).toBe(
      130000
    );
    expect(
      updated.years.find((year) => year.year === 2032)?.eraMetadata?.overriddenFields
    ).toContain("wage-income-jack");
  });

  it("relinks a field back to the era fact when the draft removes it", () => {
    const scenario = buildScenario();
    const descriptors = buildEraOverrideFieldDescriptors(
      scenario.householdMembers
    );

    const updated = applyEraOverrideDraftToScenario(
      scenario,
      "era-1",
      {},
      descriptors
    );

    expect(updated.years.find((year) => year.year === 2031)?.wageIncome.jack).toBe(
      100000
    );
    expect(
      updated.years.find((year) => year.year === 2031)?.eraMetadata?.overriddenFields
    ).not.toContain("wage-income-jack");
  });
});
