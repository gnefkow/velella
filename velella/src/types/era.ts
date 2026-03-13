/**
 * Era types (camelCase in code).
 * YAML uses kebab-case; conversion happens in scenarioService.
 */

/** Era facts have the same shape as year inputs (minus year number). */
export interface EraFacts {
  wageIncome: Record<string, number>;
  otherIncome: {
    dividendIncome: number;
    interestIncome: number;
    longTermCapitalGains: number;
    shortTermCapitalGains: number;
  };
  expenses: {
    householdExpenses: number;
    taxes: number;
    otherExpenses: number;
  };
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
  | "dividend-income"
  | "interest-income"
  | "short-term-capital-gains"
  | "long-term-capital-gains"
  | "household-expenses"
  | "taxes"
  | "other-expenses";

/** Metadata on a year for era inheritance (editing behavior only). */
export interface YearEraMetadata {
  eraId: string;
  overriddenFields: Set<YearFactsFieldKey>;
}
