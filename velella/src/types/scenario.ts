import type { InvestmentBreakdown } from "./investment";

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

/** Persisted yearly inputs (user-authored). */
export interface YearInput {
  year: number;
  wageIncome: Record<string, number>; // keyed by HouseholdMember.id
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
      "wage-income"?: Record<string, number>;
      "other-income"?: {
        "dividend-income"?: number;
        "interest-income"?: number;
        "long-term-capital-gains"?: number;
        "short-term-capital-gains"?: number;
      };
      expenses?: {
        "household-expenses"?: number;
        taxes?: number;
        "other-expenses"?: number;
      };
      "modify-investment-details"?: boolean;
      "investment-breakdown"?: {
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
    "era-metadata"?: {
      "era-id"?: string;
      "overridden-fields"?: string[];
    };
    "wage-income"?: Record<string, number>;
    "other-income"?: {
      "dividend-income"?: number;
      "interest-income"?: number;
      "long-term-capital-gains"?: number;
      "short-term-capital-gains"?: number;
    };
    expenses?: {
      "household-expenses"?: number;
      taxes?: number;
      "other-expenses"?: number;
    };
    "modify-investment-details"?: boolean;
    "investment-breakdown"?: {
      "traditional-retirement"?: number;
      "roth-retirement"?: number;
      "taxable-investments"?: number;
    };
    /** @deprecated kept for backward compatibility with older scenario files. */
    invest?: number;
  }>;
}
