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
}

export interface Scenario {
  scenarioInfo: ScenarioInfo;
  assumptions: Assumptions;
  householdMembers: HouseholdMember[];
  years: YearInput[];
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
  years?: Array<{
    year?: number;
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
  }>;
}
