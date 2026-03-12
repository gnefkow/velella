import type { YearInput } from "../types/scenario";

export interface CalculatedYearFacts {
  ordinaryIncome: number;
  totalIncome: number;
  totalExpenses: number;
}

export function buildDefaultYearInput(
  year: number,
  incomeEarnerIds: string[],
  existing?: Partial<YearInput>
): YearInput {
  const wageIncome: Record<string, number> = {};

  for (const id of incomeEarnerIds) {
    wageIncome[id] = existing?.wageIncome?.[id] ?? 0;
  }

  return {
    year,
    wageIncome,
    otherIncome: {
      dividendIncome: existing?.otherIncome?.dividendIncome ?? 0,
      interestIncome: existing?.otherIncome?.interestIncome ?? 0,
      longTermCapitalGains: existing?.otherIncome?.longTermCapitalGains ?? 0,
      shortTermCapitalGains: existing?.otherIncome?.shortTermCapitalGains ?? 0,
    },
    expenses: {
      householdExpenses: existing?.expenses?.householdExpenses ?? 0,
      taxes: existing?.expenses?.taxes ?? 0,
      otherExpenses: existing?.expenses?.otherExpenses ?? 0,
    },
  };
}

export function calculateYearFacts(yearInput?: YearInput): CalculatedYearFacts {
  const wageIncome = Object.values(yearInput?.wageIncome ?? {}).reduce(
    (sum, value) => sum + (value ?? 0),
    0
  );
  const dividendIncome = yearInput?.otherIncome.dividendIncome ?? 0;
  const interestIncome = yearInput?.otherIncome.interestIncome ?? 0;
  const shortTermCapitalGains =
    yearInput?.otherIncome.shortTermCapitalGains ?? 0;
  const longTermCapitalGains =
    yearInput?.otherIncome.longTermCapitalGains ?? 0;
  const householdExpenses = yearInput?.expenses.householdExpenses ?? 0;
  const taxes = yearInput?.expenses.taxes ?? 0;
  const otherExpenses = yearInput?.expenses.otherExpenses ?? 0;

  const ordinaryIncome =
    wageIncome + dividendIncome + interestIncome + shortTermCapitalGains;
  const totalIncome = ordinaryIncome + longTermCapitalGains;
  const totalExpenses = householdExpenses + taxes + otherExpenses;

  return {
    ordinaryIncome,
    totalIncome,
    totalExpenses,
  };
}
