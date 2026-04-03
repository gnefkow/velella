import { describe, expect, it } from "vitest";
import type { YearInput } from "../types/scenario";
import { portfolioWithdrawalsFromYearInput } from "./portfolioWithdrawals";

function baseInput(): YearInput {
  return {
    year: 2026,
    filingStatus: "single",
    wageIncome: { m1: 0 },
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
  };
}

describe("portfolioWithdrawalsFromYearInput", () => {
  it("returns 0 when yearInput is undefined", () => {
    expect(portfolioWithdrawalsFromYearInput(undefined)).toBe(0);
  });

  it("sums the four portfolio outflow fields", () => {
    const yi = baseInput();
    yi.otherIncome.preTaxDistributions = 10_000;
    yi.otherIncome.rothDistributions = 20_000;
    yi.otherIncome.shortTermCapitalGains = 3_000;
    yi.otherIncome.longTermCapitalGains = 7_000;
    expect(portfolioWithdrawalsFromYearInput(yi)).toBe(40_000);
  });

  it("does not include dividends or interest", () => {
    const yi = baseInput();
    yi.otherIncome.qualifiedDividends = 50_000;
    yi.otherIncome.ordinaryDividends = 50_000;
    yi.otherIncome.interestIncome = 50_000;
    expect(portfolioWithdrawalsFromYearInput(yi)).toBe(0);
  });
});
