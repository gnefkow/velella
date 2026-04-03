import type { InvestmentBreakdown } from "./investment";
import type { FederalTaxSource } from "./tax";

/**
 * Scenario types (camelCase in code).
 * YAML uses kebab-case; conversion happens in scenarioService.
 */

export interface ScenarioInfo {
  scenarioTitle: string;
  scenarioDescription: string;
  yearStart: number;
  yearEnd: number;
}

export interface Assumptions {
  inflationRate: number;
  initialPortfolio: number;
  marketReturn: number;
  safeWithdrawalRate: number;
}

export interface HouseholdMember {
  id: string;
  nickname: string;
  birthday: string; // MM/DD/YYYY
  incomeEarner: boolean;
}

export const FILING_STATUS_VALUES = [
  "single",
  "married-filing-jointly",
  "married-filing-separately",
] as const;

export type FilingStatus = (typeof FILING_STATUS_VALUES)[number];

/** Household-level fields that are not income / expenses / invest (e.g. tax-only inputs). */
export interface YearMisc {
  rothConversions: number;
}

/** Persisted yearly inputs (user-authored). */
export interface YearInput {
  year: number;
  /** Per-year tax filing status (not a global assumption). */
  filingStatus: FilingStatus;
  wageIncome: Record<string, number>; // keyed by HouseholdMember.id
  /** Annual Social Security benefit per income earner (UI + persistence; not in year math yet). */
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
    /** Manual federal tax estimate for this year. */
    selectedFederalTaxAmount: number;
    /** Whether federal tax uses the manual value or Velella's estimate. */
    federalTaxSource: FederalTaxSource;
    /** Manual state and local tax estimate. */
    stateLocalTaxLiability: number;
    /** Derived sum of federal + state/local; kept for expense math and YAML round-trip. */
    taxes: number;
    otherExpenses: number;
  };
  /** When false, effective invest equals income minus expenses. */
  modifyInvestmentDetails: boolean;
  /** Persisted only when `modifyInvestmentDetails` is true; otherwise treated as zero. */
  investmentBreakdown: InvestmentBreakdown;
  /** Era inheritance metadata (editing only; calculations read resolved values). */
  eraMetadata?: {
    eraId: string;
    overriddenFields: string[];
  };
}

import type { Era } from "./era";

export interface Scenario {
  scenarioInfo: ScenarioInfo;
  assumptions: Assumptions;
  householdMembers: HouseholdMember[];
  years: YearInput[];
  eras?: Era[];
}

/** Raw YAML shape (kebab-case keys) */
export interface ScenarioYaml {
  "scenario-info"?: {
    "scenario-title"?: string;
    "scenario-description"?: string;
    "year-start"?: number;
    "year-end"?: number;
  };
  assumptions?: {
    "inflation-rate"?: number;
    "initial-portfolio"?: number;
    "market-return"?: number;
    /** @deprecated use market-return */
    "portfolio-growth-rate"?: number;
    "safe-withdrawal-rate"?: number;
  };
  "household-members"?: Array<{
    id?: string;
    nickname?: string;
    birthday?: string;
    "income-earner"?: boolean;
  }>;
  eras?: Array<{
    id?: string;
    nickname?: string;
    description?: string;
    "start-year"?: number;
    "end-year"?: number;
    "era-facts"?: {
      "filing-status"?: string;
      "wage-income"?: Record<string, number>;
      "social-security-benefits"?: Record<string, number>;
      misc?: {
        "roth-conversions"?: number;
      };
      "other-income"?: {
        "pre-tax-distributions"?: number;
        "roth-distributions"?: number;
        "qualified-dividends"?: number;
        "ordinary-dividends"?: number;
        /** @deprecated kept for backward compatibility with older scenario files. */
        "dividend-income"?: number;
        "interest-income"?: number;
        "long-term-capital-gains"?: number;
        "short-term-capital-gains"?: number;
      };
      expenses?: {
        "household-expenses"?: number;
        "selected-federal-tax-amount"?: number;
        "federal-tax-source"?: FederalTaxSource;
        "state-local-tax-liability"?: number;
        taxes?: number;
        "other-expenses"?: number;
      };
      "modify-investment-details"?: boolean;
      "investment-breakdown"?: {
        "pre-tax-401k-contribution"?: number;
        "pre-tax-ira-contribution"?: number;
        "hsa-contribution"?: number;
        /** @deprecated migrated to pre-tax-401k-contribution on load */
        "traditional-retirement"?: number;
        "roth-retirement"?: number;
        "taxable-investments"?: number;
      };
      /** @deprecated kept for backward compatibility with older scenario files. */
      invest?: number;
    };
  }>;
  years?: Array<{
    year?: number;
    "filing-status"?: string;
    "era-metadata"?: {
      "era-id"?: string;
      "overridden-fields"?: string[];
    };
    "wage-income"?: Record<string, number>;
    "social-security-benefits"?: Record<string, number>;
    misc?: {
      "roth-conversions"?: number;
    };
    "other-income"?: {
      "pre-tax-distributions"?: number;
      "roth-distributions"?: number;
      "qualified-dividends"?: number;
      "ordinary-dividends"?: number;
      /** @deprecated kept for backward compatibility with older scenario files. */
      "dividend-income"?: number;
      "interest-income"?: number;
      "long-term-capital-gains"?: number;
      "short-term-capital-gains"?: number;
    };
    expenses?: {
      "household-expenses"?: number;
      "selected-federal-tax-amount"?: number;
      "federal-tax-source"?: FederalTaxSource;
      "state-local-tax-liability"?: number;
      taxes?: number;
      "other-expenses"?: number;
    };
    "modify-investment-details"?: boolean;
    "investment-breakdown"?: {
      "pre-tax-401k-contribution"?: number;
      "pre-tax-ira-contribution"?: number;
      "hsa-contribution"?: number;
      /** @deprecated migrated to pre-tax-401k-contribution on load */
      "traditional-retirement"?: number;
      "roth-retirement"?: number;
      "taxable-investments"?: number;
    };
    /** @deprecated kept for backward compatibility with older scenario files. */
    invest?: number;
  }>;
}
