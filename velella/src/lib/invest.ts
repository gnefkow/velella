import type { EraFacts } from "../types/era";
import type { YearInput } from "../types/scenario";
import { calculateYearFacts } from "./yearFacts";

export function yearInputFromEraFacts(eraFacts: EraFacts, year = 0): YearInput {
  return {
    year,
    filingStatus: eraFacts.filingStatus,
    wageIncome: eraFacts.wageIncome,
    socialSecurityBenefits: { ...eraFacts.socialSecurityBenefits },
    otherIncome: eraFacts.otherIncome,
    misc: eraFacts.misc,
    expenses: eraFacts.expenses,
    modifyInvestmentDetails: eraFacts.modifyInvestmentDetails,
    investmentBreakdown: eraFacts.investmentBreakdown,
  };
}

export function investmentBreakdownTotal(
  yearInputOrEraFacts:
    | Pick<YearInput, "investmentBreakdown">
    | Pick<EraFacts, "investmentBreakdown">
): number {
  const breakdown = yearInputOrEraFacts.investmentBreakdown;
  return (
    (breakdown.preTax401kContribution ?? 0) +
    (breakdown.preTaxIraContribution ?? 0) +
    (breakdown.hsaContribution ?? 0) +
    (breakdown.rothRetirement ?? 0) +
    (breakdown.taxableInvestments ?? 0)
  );
}

export function availableToInvestFromYearInput(
  yearInput?: YearInput
): number {
  const { totalIncome, totalExpenses } = calculateYearFacts(yearInput);
  return totalIncome - totalExpenses;
}

/**
 * Amount added to the portfolio for the year (single source for engine + UI).
 * In automatic mode (no breakdown), negative cash flow is clamped to 0 — we do
 * not treat a shortfall as negative portfolio contribution.
 */
export function effectiveInvestFromYearInput(yearInput: YearInput): number {
  const available = availableToInvestFromYearInput(yearInput);
  if (!yearInput.modifyInvestmentDetails) {
    return Math.max(0, available);
  }
  return investmentBreakdownTotal(yearInput);
}

export function investmentDifferenceFromYearInput(
  yearInput: YearInput
): number {
  const available = availableToInvestFromYearInput(yearInput);
  return available - effectiveInvestFromYearInput(yearInput);
}
