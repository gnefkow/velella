import type {
  EraFacts,
  YearFactsFieldKey,
} from "../types/era";
import type {
  HouseholdMember,
  YearInput,
} from "../types/scenario";

export interface EraOverrideFieldDescriptor {
  fieldKey: YearFactsFieldKey;
  fieldLabel: string;
  yearRowLabel: (year: number) => string;
  readEraValue: (eraFacts: EraFacts) => number;
  writeEraValue: (eraFacts: EraFacts, value: number) => EraFacts;
  readYearValue: (yearInput: YearInput) => number;
  writeYearValue: (yearInput: YearInput, value: number) => YearInput;
}

function buildYearRowLabel(suffix: string) {
  return (year: number) => `${year} ${suffix}`;
}

export function buildEraOverrideFieldDescriptors(
  incomeEarners: HouseholdMember[]
): EraOverrideFieldDescriptor[] {
  const wageFields = incomeEarners.map((member) => {
    const memberLabel = member.nickname || "Member";
    const fieldKey = `wage-income-${member.id}` as YearFactsFieldKey;

    return {
      fieldKey,
      fieldLabel: `${memberLabel} Wages`,
      yearRowLabel: buildYearRowLabel("Wages"),
      readEraValue: (eraFacts) => eraFacts.wageIncome[member.id] ?? 0,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        wageIncome: {
          ...eraFacts.wageIncome,
          [member.id]: value,
        },
      }),
      readYearValue: (yearInput) => yearInput.wageIncome[member.id] ?? 0,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        wageIncome: {
          ...yearInput.wageIncome,
          [member.id]: value,
        },
      }),
    } satisfies EraOverrideFieldDescriptor;
  });

  const otherFields: EraOverrideFieldDescriptor[] = [
    {
      fieldKey: "dividend-income",
      fieldLabel: "Dividend Income",
      yearRowLabel: buildYearRowLabel("Dividend Income"),
      readEraValue: (eraFacts) => eraFacts.otherIncome.dividendIncome,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        otherIncome: {
          ...eraFacts.otherIncome,
          dividendIncome: value,
        },
      }),
      readYearValue: (yearInput) => yearInput.otherIncome.dividendIncome,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        otherIncome: {
          ...yearInput.otherIncome,
          dividendIncome: value,
        },
      }),
    },
    {
      fieldKey: "interest-income",
      fieldLabel: "Interest Income",
      yearRowLabel: buildYearRowLabel("Interest Income"),
      readEraValue: (eraFacts) => eraFacts.otherIncome.interestIncome,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        otherIncome: {
          ...eraFacts.otherIncome,
          interestIncome: value,
        },
      }),
      readYearValue: (yearInput) => yearInput.otherIncome.interestIncome,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        otherIncome: {
          ...yearInput.otherIncome,
          interestIncome: value,
        },
      }),
    },
    {
      fieldKey: "short-term-capital-gains",
      fieldLabel: "Capital Gains (Short Term)",
      yearRowLabel: buildYearRowLabel("Capital Gains (Short Term)"),
      readEraValue: (eraFacts) => eraFacts.otherIncome.shortTermCapitalGains,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        otherIncome: {
          ...eraFacts.otherIncome,
          shortTermCapitalGains: value,
        },
      }),
      readYearValue: (yearInput) => yearInput.otherIncome.shortTermCapitalGains,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        otherIncome: {
          ...yearInput.otherIncome,
          shortTermCapitalGains: value,
        },
      }),
    },
    {
      fieldKey: "long-term-capital-gains",
      fieldLabel: "Capital Gains (Long Term)",
      yearRowLabel: buildYearRowLabel("Capital Gains (Long Term)"),
      readEraValue: (eraFacts) => eraFacts.otherIncome.longTermCapitalGains,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        otherIncome: {
          ...eraFacts.otherIncome,
          longTermCapitalGains: value,
        },
      }),
      readYearValue: (yearInput) => yearInput.otherIncome.longTermCapitalGains,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        otherIncome: {
          ...yearInput.otherIncome,
          longTermCapitalGains: value,
        },
      }),
    },
    {
      fieldKey: "household-expenses",
      fieldLabel: "Household Expenses",
      yearRowLabel: buildYearRowLabel("Household Expenses"),
      readEraValue: (eraFacts) => eraFacts.expenses.householdExpenses,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        expenses: {
          ...eraFacts.expenses,
          householdExpenses: value,
        },
      }),
      readYearValue: (yearInput) => yearInput.expenses.householdExpenses,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        expenses: {
          ...yearInput.expenses,
          householdExpenses: value,
        },
      }),
    },
    {
      fieldKey: "taxes",
      fieldLabel: "Taxes",
      yearRowLabel: buildYearRowLabel("Taxes"),
      readEraValue: (eraFacts) => eraFacts.expenses.taxes,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        expenses: {
          ...eraFacts.expenses,
          taxes: value,
        },
      }),
      readYearValue: (yearInput) => yearInput.expenses.taxes,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        expenses: {
          ...yearInput.expenses,
          taxes: value,
        },
      }),
    },
    {
      fieldKey: "other-expenses",
      fieldLabel: "Other Major Expenses",
      yearRowLabel: buildYearRowLabel("Other Major Expenses"),
      readEraValue: (eraFacts) => eraFacts.expenses.otherExpenses,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        expenses: {
          ...eraFacts.expenses,
          otherExpenses: value,
        },
      }),
      readYearValue: (yearInput) => yearInput.expenses.otherExpenses,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        expenses: {
          ...yearInput.expenses,
          otherExpenses: value,
        },
      }),
    },
    {
      fieldKey: "traditional-retirement",
      fieldLabel: "Traditional Retirement",
      yearRowLabel: buildYearRowLabel("Traditional Retirement"),
      readEraValue: (eraFacts) =>
        eraFacts.investmentBreakdown.traditionalRetirement,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        investmentBreakdown: {
          ...eraFacts.investmentBreakdown,
          traditionalRetirement: value,
        },
      }),
      readYearValue: (yearInput) =>
        yearInput.investmentBreakdown.traditionalRetirement,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        investmentBreakdown: {
          ...yearInput.investmentBreakdown,
          traditionalRetirement: value,
        },
      }),
    },
    {
      fieldKey: "roth-retirement",
      fieldLabel: "Roth Retirement",
      yearRowLabel: buildYearRowLabel("Roth Retirement"),
      readEraValue: (eraFacts) => eraFacts.investmentBreakdown.rothRetirement,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        investmentBreakdown: {
          ...eraFacts.investmentBreakdown,
          rothRetirement: value,
        },
      }),
      readYearValue: (yearInput) => yearInput.investmentBreakdown.rothRetirement,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        investmentBreakdown: {
          ...yearInput.investmentBreakdown,
          rothRetirement: value,
        },
      }),
    },
    {
      fieldKey: "taxable-investments",
      fieldLabel: "Taxable Investments",
      yearRowLabel: buildYearRowLabel("Taxable Investments"),
      readEraValue: (eraFacts) =>
        eraFacts.investmentBreakdown.taxableInvestments,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        investmentBreakdown: {
          ...eraFacts.investmentBreakdown,
          taxableInvestments: value,
        },
      }),
      readYearValue: (yearInput) =>
        yearInput.investmentBreakdown.taxableInvestments,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        investmentBreakdown: {
          ...yearInput.investmentBreakdown,
          taxableInvestments: value,
        },
      }),
    },
  ];

  return [...wageFields, ...otherFields];
}
