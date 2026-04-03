import type { YearInput } from "../types/scenario";
import { portfolioWithdrawalsFromYearInput } from "./portfolioWithdrawals";
import { calculateYearFacts } from "./yearFacts";

export interface CashflowSummaryNumbers {
  headerTotal: number;
  expenses: number;
  incomeExPortfolio: number;
  pullingFromPortfolio: number;
}

/**
 * Era-level cashflow breakdown: header matches income − expenses (same as
 * available-to-invest). Pulling from portfolio matches
 * portfolioWithdrawalsFromYearInput (pre-tax + Roth + ST/LT realized gains as
 * modeled for the timeline engine).
 */
export function cashflowSummaryFromYearInput(
  yearInput: YearInput
): CashflowSummaryNumbers {
  const { totalIncome, totalExpenses } = calculateYearFacts(yearInput);
  const pullingFromPortfolio = portfolioWithdrawalsFromYearInput(yearInput);
  return {
    headerTotal: totalIncome - totalExpenses,
    expenses: totalExpenses,
    incomeExPortfolio: totalIncome - pullingFromPortfolio,
    pullingFromPortfolio,
  };
}
