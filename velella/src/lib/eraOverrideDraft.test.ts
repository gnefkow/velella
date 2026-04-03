import { describe, expect, it } from "vitest";
import type { Scenario } from "../types/scenario";
import { buildEraOverrideFieldDescriptors } from "./eraOverrideFields";
import {
  applyEraOverrideDraftToScenario,
  buildEraOverrideDraftFromScenario,
  buildOverrideSummary,
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
          filingStatus: "single",
          wageIncome: { jack: 100000 },
          socialSecurityBenefits: { jack: 0 },
          otherIncome: {
            preTaxDistributions: 0,
            rothDistributions: 0,
            qualifiedDividends: 0,
            ordinaryDividends: 0,
            interestIncome: 0,
            longTermCapitalGains: 0,
            shortTermCapitalGains: 0,
          },
          expenses: {
            householdExpenses: 0,
            selectedFederalTaxAmount: 0,
            federalTaxSource: "manual",
            stateLocalTaxLiability: 0,
            taxes: 0,
            otherExpenses: 0,
          },
          modifyInvestmentDetails: false,
          investmentBreakdown: {
            preTax401kContribution: 0,
            preTaxIraContribution: 0,
            hsaContribution: 0,
            rothRetirement: 0,
            taxableInvestments: 0,
          },
          misc: { rothConversions: 0 },
        },
      },
    ],
    years: [
      {
        year: 2030,
        filingStatus: "single",
        wageIncome: { jack: 100000 },
        socialSecurityBenefits: { jack: 0 },
        otherIncome: {
          preTaxDistributions: 0,
          rothDistributions: 0,
          qualifiedDividends: 0,
          ordinaryDividends: 0,
          interestIncome: 0,
          longTermCapitalGains: 0,
          shortTermCapitalGains: 0,
        },
        misc: { rothConversions: 0 },
        expenses: {
          householdExpenses: 0,
          selectedFederalTaxAmount: 0,
          federalTaxSource: "manual",
          stateLocalTaxLiability: 0,
          taxes: 0,
          otherExpenses: 0,
        },
        modifyInvestmentDetails: false,
        investmentBreakdown: {
          preTax401kContribution: 0,
          preTaxIraContribution: 0,
          hsaContribution: 0,
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
        filingStatus: "single",
        wageIncome: { jack: 125000 },
        socialSecurityBenefits: { jack: 0 },
        otherIncome: {
          preTaxDistributions: 0,
          rothDistributions: 0,
          qualifiedDividends: 0,
          ordinaryDividends: 0,
          interestIncome: 0,
          longTermCapitalGains: 0,
          shortTermCapitalGains: 0,
        },
        misc: { rothConversions: 0 },
        expenses: {
          householdExpenses: 0,
          selectedFederalTaxAmount: 0,
          federalTaxSource: "manual",
          stateLocalTaxLiability: 0,
          taxes: 0,
          otherExpenses: 0,
        },
        modifyInvestmentDetails: false,
        investmentBreakdown: {
          preTax401kContribution: 0,
          preTaxIraContribution: 0,
          hsaContribution: 0,
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
        filingStatus: "single",
        wageIncome: { jack: 100000 },
        socialSecurityBenefits: { jack: 0 },
        otherIncome: {
          preTaxDistributions: 0,
          rothDistributions: 0,
          qualifiedDividends: 0,
          ordinaryDividends: 0,
          interestIncome: 0,
          longTermCapitalGains: 0,
          shortTermCapitalGains: 0,
        },
        misc: { rothConversions: 0 },
        expenses: {
          householdExpenses: 0,
          selectedFederalTaxAmount: 0,
          federalTaxSource: "manual",
          stateLocalTaxLiability: 0,
          taxes: 0,
          otherExpenses: 0,
        },
        modifyInvestmentDetails: false,
        investmentBreakdown: {
          preTax401kContribution: 0,
          preTaxIraContribution: 0,
          hsaContribution: 0,
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

describe("buildOverrideSummary", () => {
  it("formats filing-status indices as readable labels", () => {
    expect(
      buildOverrideSummary("filing-status", { 2030: 0, 2031: 2 }, [2030, 2031])
    ).toBe("Single - Married filing separately");
    expect(
      buildOverrideSummary("filing-status", { 2030: 1 }, [2030, 2031])
    ).toBe("Married filing jointly");
  });
});

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
