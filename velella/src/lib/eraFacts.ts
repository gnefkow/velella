import type { EraFacts } from "../types/era";
import type { YearInput } from "../types/scenario";

/** Builds default era facts from income earner IDs. */
export function buildDefaultEraFacts(
  incomeEarnerIds: string[],
  existing?: Partial<EraFacts>
): EraFacts {
  const wageIncome: Record<string, number> = {};
  for (const id of incomeEarnerIds) {
    wageIncome[id] = existing?.wageIncome?.[id] ?? 0;
  }
  return {
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
    modifyInvestmentDetails: existing?.modifyInvestmentDetails ?? false,
    investmentBreakdown: {
      traditionalRetirement:
        existing?.investmentBreakdown?.traditionalRetirement ?? 0,
      rothRetirement: existing?.investmentBreakdown?.rothRetirement ?? 0,
      taxableInvestments:
        existing?.investmentBreakdown?.taxableInvestments ?? 0,
    },
  };
}

/** Applies era facts to a year input, merging with overrides. */
export function applyEraFactsToYearInput(
  yearInput: YearInput,
  eraFacts: EraFacts,
  overriddenFields: string[]
): YearInput {
  const isOverridden = (key: string) => overriddenFields.includes(key);

  const wageIncome: Record<string, number> = {};
  for (const [id] of Object.entries(yearInput.wageIncome)) {
    const fieldKey = `wage-income-${id}`;
    wageIncome[id] = isOverridden(fieldKey)
      ? yearInput.wageIncome[id] ?? 0
      : eraFacts.wageIncome[id] ?? 0;
  }
  for (const id of Object.keys(eraFacts.wageIncome)) {
    if (!(id in wageIncome)) {
      wageIncome[id] = isOverridden(`wage-income-${id}`)
        ? yearInput.wageIncome[id] ?? 0
        : eraFacts.wageIncome[id] ?? 0;
    }
  }

  return {
    ...yearInput,
    wageIncome,
    otherIncome: {
      dividendIncome: isOverridden("dividend-income")
        ? yearInput.otherIncome.dividendIncome
        : eraFacts.otherIncome.dividendIncome,
      interestIncome: isOverridden("interest-income")
        ? yearInput.otherIncome.interestIncome
        : eraFacts.otherIncome.interestIncome,
      longTermCapitalGains: isOverridden("long-term-capital-gains")
        ? yearInput.otherIncome.longTermCapitalGains
        : eraFacts.otherIncome.longTermCapitalGains,
      shortTermCapitalGains: isOverridden("short-term-capital-gains")
        ? yearInput.otherIncome.shortTermCapitalGains
        : eraFacts.otherIncome.shortTermCapitalGains,
    },
    expenses: {
      householdExpenses: isOverridden("household-expenses")
        ? yearInput.expenses.householdExpenses
        : eraFacts.expenses.householdExpenses,
      taxes: isOverridden("taxes")
        ? yearInput.expenses.taxes
        : eraFacts.expenses.taxes,
      otherExpenses: isOverridden("other-expenses")
        ? yearInput.expenses.otherExpenses
        : eraFacts.expenses.otherExpenses,
    },
    modifyInvestmentDetails: isOverridden("modify-investment-details")
      ? yearInput.modifyInvestmentDetails
      : eraFacts.modifyInvestmentDetails,
    investmentBreakdown: {
      traditionalRetirement: isOverridden("traditional-retirement")
        ? yearInput.investmentBreakdown.traditionalRetirement
        : eraFacts.investmentBreakdown.traditionalRetirement,
      rothRetirement: isOverridden("roth-retirement")
        ? yearInput.investmentBreakdown.rothRetirement
        : eraFacts.investmentBreakdown.rothRetirement,
      taxableInvestments: isOverridden("taxable-investments")
        ? yearInput.investmentBreakdown.taxableInvestments
        : eraFacts.investmentBreakdown.taxableInvestments,
    },
  };
}
