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
    wageIncome: { m1: 100_000 },
    otherIncome: {
      dividendIncome: 0,
      interestIncome: 0,
      longTermCapitalGains: 0,
      shortTermCapitalGains: 0,
    },
    expenses: {
      householdExpenses: 40_000,
      taxes: 0,
      otherExpenses: 0,
    },
    modifyInvestmentDetails: false,
    investmentBreakdown: {
      traditionalRetirement: 0,
      rothRetirement: 0,
      taxableInvestments: 0,
    },
    ...over,
  };
}

describe("invest helpers", () => {
  it("defaults effective invest to income minus expenses", () => {
    const yi = makeYearInput({ modifyInvestmentDetails: false });
    expect(effectiveInvestFromYearInput(yi)).toBe(60_000);
    expect(investmentDifferenceFromYearInput(yi)).toBe(0);
  });

  it("uses stored invest when modify is on", () => {
    const yi = makeYearInput({
      modifyInvestmentDetails: true,
      investmentBreakdown: {
        traditionalRetirement: 20_000,
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
        traditionalRetirement: 30_000,
        rothRetirement: 20_000,
        taxableInvestments: 20_000,
      },
    });
    expect(investmentDifferenceFromYearInput(yi)).toBe(-10_000);
  });

  it("sums the investment breakdown buckets", () => {
    const yi = makeYearInput({
      investmentBreakdown: {
        traditionalRetirement: 3_000,
        rothRetirement: 4_000,
        taxableInvestments: 5_000,
      },
    });
    expect(investmentBreakdownTotal(yi)).toBe(12_000);
  });
});
