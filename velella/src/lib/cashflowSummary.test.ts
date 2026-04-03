import { describe, expect, it } from "vitest";
import type { YearInput } from "../types/scenario";
import { cashflowSummaryFromYearInput } from "./cashflowSummary";

function makeYearInput(over: Partial<YearInput>): YearInput {
  return {
    year: 2026,
    filingStatus: "single",
    wageIncome: { m1: 100_000 },
    socialSecurityBenefits: { m1: 0 },
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
      householdExpenses: 40_000,
      selectedFederalTaxAmount: 5_000,
      federalTaxSource: "manual",
      stateLocalTaxLiability: 5_000,
      taxes: 10_000,
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
    ...over,
  };
}

describe("cashflowSummaryFromYearInput", () => {
  it("accumulation: no portfolio pull; income ex portfolio equals total income", () => {
    const yi = makeYearInput({
      wageIncome: { m1: 150_000 },
      expenses: {
        householdExpenses: 80_000,
        selectedFederalTaxAmount: 10_000,
        federalTaxSource: "manual",
        stateLocalTaxLiability: 10_000,
        taxes: 20_000,
        otherExpenses: 0,
      },
    });
    const s = cashflowSummaryFromYearInput(yi);
    expect(s.pullingFromPortfolio).toBe(0);
    expect(s.expenses).toBe(100_000);
    expect(s.incomeExPortfolio).toBe(150_000);
    expect(s.headerTotal).toBe(50_000);
    expect(s.incomeExPortfolio + s.pullingFromPortfolio - s.expenses).toBe(
      s.headerTotal
    );
  });

  it("coast: pre-tax distributions count as pull and in total income", () => {
    const yi = makeYearInput({
      wageIncome: { m1: 120_000 },
      otherIncome: {
        preTaxDistributions: 10_000,
        rothDistributions: 0,
        qualifiedDividends: 0,
        ordinaryDividends: 0,
        interestIncome: 0,
        longTermCapitalGains: 0,
        shortTermCapitalGains: 0,
      },
      expenses: {
        householdExpenses: 80_000,
        selectedFederalTaxAmount: 10_000,
        federalTaxSource: "manual",
        stateLocalTaxLiability: 10_000,
        taxes: 20_000,
        otherExpenses: 0,
      },
    });
    const s = cashflowSummaryFromYearInput(yi);
    expect(s.pullingFromPortfolio).toBe(10_000);
    expect(s.incomeExPortfolio).toBe(120_000);
    expect(s.headerTotal).toBe(30_000);
    expect(s.incomeExPortfolio + s.pullingFromPortfolio - s.expenses).toBe(
      s.headerTotal
    );
  });

  it("decumulation: portfolio pull plus other income meets expenses", () => {
    const yi = makeYearInput({
      wageIncome: { m1: 0 },
      socialSecurityBenefits: { m1: 20_000 },
      otherIncome: {
        preTaxDistributions: 70_000,
        rothDistributions: 0,
        qualifiedDividends: 0,
        ordinaryDividends: 0,
        interestIncome: 0,
        longTermCapitalGains: 10_000,
        shortTermCapitalGains: 0,
      },
      expenses: {
        householdExpenses: 70_000,
        selectedFederalTaxAmount: 15_000,
        federalTaxSource: "manual",
        stateLocalTaxLiability: 15_000,
        taxes: 30_000,
        otherExpenses: 0,
      },
    });
    const s = cashflowSummaryFromYearInput(yi);
    expect(s.pullingFromPortfolio).toBe(80_000);
    expect(s.incomeExPortfolio).toBe(20_000);
    expect(s.expenses).toBe(100_000);
    expect(s.headerTotal).toBe(0);
    expect(s.incomeExPortfolio + s.pullingFromPortfolio - s.expenses).toBe(
      s.headerTotal
    );
  });

  it("includes Roth distributions in pull and total income", () => {
    const yi = makeYearInput({
      wageIncome: { m1: 50_000 },
      otherIncome: {
        preTaxDistributions: 0,
        rothDistributions: 25_000,
        qualifiedDividends: 0,
        ordinaryDividends: 0,
        interestIncome: 0,
        longTermCapitalGains: 0,
        shortTermCapitalGains: 0,
      },
      expenses: {
        householdExpenses: 40_000,
        selectedFederalTaxAmount: 0,
        federalTaxSource: "manual",
        stateLocalTaxLiability: 0,
        taxes: 0,
        otherExpenses: 0,
      },
    });
    const s = cashflowSummaryFromYearInput(yi);
    expect(s.pullingFromPortfolio).toBe(25_000);
    expect(s.incomeExPortfolio).toBe(50_000);
    expect(s.headerTotal).toBe(35_000);
  });

  it("includes short- and long-term realized gains in pulling from portfolio", () => {
    const yi = makeYearInput({
      wageIncome: { m1: 100_000 },
      otherIncome: {
        preTaxDistributions: 5_000,
        rothDistributions: 3_000,
        qualifiedDividends: 0,
        ordinaryDividends: 0,
        interestIncome: 0,
        longTermCapitalGains: 7_000,
        shortTermCapitalGains: 2_000,
      },
      expenses: {
        householdExpenses: 40_000,
        selectedFederalTaxAmount: 0,
        federalTaxSource: "manual",
        stateLocalTaxLiability: 0,
        taxes: 0,
        otherExpenses: 0,
      },
    });
    const s = cashflowSummaryFromYearInput(yi);
    expect(s.pullingFromPortfolio).toBe(17_000);
    expect(s.incomeExPortfolio + s.pullingFromPortfolio - s.expenses).toBe(
      s.headerTotal
    );
  });
});
