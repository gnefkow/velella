import type { InvestmentBreakdown } from "./investment";
import type { FilingStatus, YearMisc } from "./scenario";
import type { FederalTaxSource } from "./tax";

/**
 * Era types (camelCase in code).
 * YAML uses kebab-case; conversion happens in scenarioService.
 */

/** Era facts have the same shape as year inputs (minus year number). */
export interface EraFacts {
  filingStatus: FilingStatus;
  wageIncome: Record<string, number>;
  socialSecurityBenefits: Record<string, number>;
  otherIncome: {
    preTaxDistributions: number;
    rothDistributions: number;
    qualifiedDividends: number;
    ordinaryDividends: number;
    interestIncome: number;
    longTermCapitalGains: number;
    shortTermCapitalGains: number;
  };
  misc: YearMisc;
  expenses: {
    householdExpenses: number;
    selectedFederalTaxAmount: number;
    federalTaxSource: FederalTaxSource;
    stateLocalTaxLiability: number;
    taxes: number;
    otherExpenses: number;
  };
  /** When false, invest amount follows income minus expenses for the era template. */
  modifyInvestmentDetails: boolean;
  /** Used for portfolio math only when `modifyInvestmentDetails` is true. */
  investmentBreakdown: InvestmentBreakdown;
}

export interface Era {
  id: string;
  nickname: string;
  description: string;
  startYear: number;
  endYear: number;
  eraFacts: EraFacts;
}

/** Field keys that can be overridden when a year is in an era. */
export type YearFactsFieldKey =
  | `wage-income-${string}`
  | `social-security-benefits-${string}`
  | "filing-status"
  | "pre-tax-distributions"
  | "roth-distributions"
  | "roth-conversions"
  | "qualified-dividends"
  | "ordinary-dividends"
  | "interest-income"
  | "short-term-capital-gains"
  | "long-term-capital-gains"
  | "household-expenses"
  | "selected-federal-tax-amount"
  | "state-local-tax-liability"
  | "other-expenses"
  | "modify-investment-details"
  | "pre-tax-401k-contribution"
  | "pre-tax-ira-contribution"
  | "hsa-contribution"
  | "roth-retirement"
  | "taxable-investments";

/** Metadata on a year for era inheritance (editing behavior only). */
export interface YearEraMetadata {
  eraId: string;
  overriddenFields: Set<YearFactsFieldKey>;
}
