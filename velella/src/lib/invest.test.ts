import { describe, expect, it } from "vitest";
import type { YearInput } from "../types/scenario";
import {
  effectiveInvestFromYearInput,
  investmentBreakdownTotal,
  investmentDifferenceFromYearInput,
} from "./invest";

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
    ...over,
  };
}

describe("invest helpers", () => {
  it("defaults effective invest to income minus expenses", () => {
    const yi = makeYearInput({ modifyInvestmentDetails: false });
    expect(effectiveInvestFromYearInput(yi)).toBe(60_000);
    expect(investmentDifferenceFromYearInput(yi)).toBe(0);
  });

  it("automatic mode clamps effective invest to zero when cash flow is negative", () => {
    const yi = makeYearInput({
      modifyInvestmentDetails: false,
      wageIncome: { m1: 50_000 },
      expenses: {
        householdExpenses: 100_000,
        selectedFederalTaxAmount: 0,
        federalTaxSource: "manual",
        stateLocalTaxLiability: 0,
        taxes: 0,
        otherExpenses: 0,
      },
    });
    expect(effectiveInvestFromYearInput(yi)).toBe(0);
    expect(investmentDifferenceFromYearInput(yi)).toBe(-50_000);
  });

  it("uses stored invest when modify is on", () => {
    const yi = makeYearInput({
      modifyInvestmentDetails: true,
      investmentBreakdown: {
        preTax401kContribution: 20_000,
        preTaxIraContribution: 0,
        hsaContribution: 0,
        rothRetirement: 15_000,
        taxableInvestments: 10_000,
      },
    });
    expect(effectiveInvestFromYearInput(yi)).toBe(45_000);
    expect(investmentDifferenceFromYearInput(yi)).toBe(15_000);
  });

  it("allows negative difference when invest exceeds available", () => {
    const yi = makeYearInput({
      modifyInvestmentDetails: true,
      investmentBreakdown: {
        preTax401kContribution: 30_000,
        preTaxIraContribution: 0,
        hsaContribution: 0,
        rothRetirement: 20_000,
        taxableInvestments: 20_000,
      },
    });
    expect(investmentDifferenceFromYearInput(yi)).toBe(-10_000);
  });

  it("sums the investment breakdown buckets", () => {
    const yi = makeYearInput({
      investmentBreakdown: {
        preTax401kContribution: 1_000,
        preTaxIraContribution: 2_000,
        hsaContribution: 3_000,
        rothRetirement: 4_000,
        taxableInvestments: 5_000,
      },
    });
    expect(investmentBreakdownTotal(yi)).toBe(15_000);
  });
});
