import type {
  EraFacts,
  YearFactsFieldKey,
} from "../types/era";
import type {
  HouseholdMember,
  YearInput,
} from "../types/scenario";
import { filingStatusToIndex, indexToFilingStatus } from "./filingStatus";
import { expensesWithSyncedTaxTotal } from "./yearFacts";

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

  const socialSecurityFields = incomeEarners.map((member) => {
    const memberLabel = member.nickname || "Member";
    const fieldKey =
      `social-security-benefits-${member.id}` as YearFactsFieldKey;

    return {
      fieldKey,
      fieldLabel: `${memberLabel} Social Security`,
      yearRowLabel: buildYearRowLabel("Social Security"),
      readEraValue: (eraFacts) =>
        eraFacts.socialSecurityBenefits[member.id] ?? 0,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        socialSecurityBenefits: {
          ...eraFacts.socialSecurityBenefits,
          [member.id]: value,
        },
      }),
      readYearValue: (yearInput) =>
        yearInput.socialSecurityBenefits[member.id] ?? 0,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        socialSecurityBenefits: {
          ...yearInput.socialSecurityBenefits,
          [member.id]: value,
        },
      }),
    } satisfies EraOverrideFieldDescriptor;
  });

  const otherFields: EraOverrideFieldDescriptor[] = [
    {
      fieldKey: "pre-tax-distributions",
      fieldLabel: "Pre-Tax Distributions",
      yearRowLabel: buildYearRowLabel("Pre-Tax Distributions"),
      readEraValue: (eraFacts) => eraFacts.otherIncome.preTaxDistributions,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        otherIncome: {
          ...eraFacts.otherIncome,
          preTaxDistributions: value,
        },
      }),
      readYearValue: (yearInput) => yearInput.otherIncome.preTaxDistributions,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        otherIncome: {
          ...yearInput.otherIncome,
          preTaxDistributions: value,
        },
      }),
    },
    {
      fieldKey: "roth-distributions",
      fieldLabel: "Roth Distributions",
      yearRowLabel: buildYearRowLabel("Roth Distributions"),
      readEraValue: (eraFacts) => eraFacts.otherIncome.rothDistributions,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        otherIncome: {
          ...eraFacts.otherIncome,
          rothDistributions: value,
        },
      }),
      readYearValue: (yearInput) => yearInput.otherIncome.rothDistributions,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        otherIncome: {
          ...yearInput.otherIncome,
          rothDistributions: value,
        },
      }),
    },
    {
      fieldKey: "roth-conversions",
      fieldLabel: "Roth Conversions",
      yearRowLabel: buildYearRowLabel("Roth Conversions"),
      readEraValue: (eraFacts) => eraFacts.misc.rothConversions,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        misc: { ...eraFacts.misc, rothConversions: value },
      }),
      readYearValue: (yearInput) => yearInput.misc.rothConversions,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        misc: { ...yearInput.misc, rothConversions: value },
      }),
    },
    {
      fieldKey: "qualified-dividends",
      fieldLabel: "Qualified Dividends",
      yearRowLabel: buildYearRowLabel("Qualified Dividends"),
      readEraValue: (eraFacts) => eraFacts.otherIncome.qualifiedDividends,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        otherIncome: {
          ...eraFacts.otherIncome,
          qualifiedDividends: value,
        },
      }),
      readYearValue: (yearInput) => yearInput.otherIncome.qualifiedDividends,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        otherIncome: {
          ...yearInput.otherIncome,
          qualifiedDividends: value,
        },
      }),
    },
    {
      fieldKey: "ordinary-dividends",
      fieldLabel: "Ordinary Dividends",
      yearRowLabel: buildYearRowLabel("Ordinary Dividends"),
      readEraValue: (eraFacts) => eraFacts.otherIncome.ordinaryDividends,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        otherIncome: {
          ...eraFacts.otherIncome,
          ordinaryDividends: value,
        },
      }),
      readYearValue: (yearInput) => yearInput.otherIncome.ordinaryDividends,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        otherIncome: {
          ...yearInput.otherIncome,
          ordinaryDividends: value,
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
      fieldLabel: "Realized Taxable Gains (Short Term)",
      yearRowLabel: buildYearRowLabel("Realized Taxable Gains (Short Term)"),
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
      fieldLabel: "Realized Taxable Gains (Long Term)",
      yearRowLabel: buildYearRowLabel("Realized Taxable Gains (Long Term)"),
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
      fieldKey: "filing-status",
      fieldLabel: "Tax filing status",
      yearRowLabel: buildYearRowLabel("Tax filing status"),
      readEraValue: (eraFacts) => filingStatusToIndex(eraFacts.filingStatus),
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        filingStatus: indexToFilingStatus(value),
      }),
      readYearValue: (yearInput) => filingStatusToIndex(yearInput.filingStatus),
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        filingStatus: indexToFilingStatus(value),
      }),
    },
    {
      fieldKey: "selected-federal-tax-amount",
      fieldLabel: "Taxes: Federal",
      yearRowLabel: buildYearRowLabel("Taxes: Federal"),
      readEraValue: (eraFacts) => eraFacts.expenses.selectedFederalTaxAmount,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        expenses: expensesWithSyncedTaxTotal({
          ...eraFacts.expenses,
          selectedFederalTaxAmount: value,
        }),
      }),
      readYearValue: (yearInput) =>
        yearInput.expenses.selectedFederalTaxAmount,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        expenses: expensesWithSyncedTaxTotal({
          ...yearInput.expenses,
          selectedFederalTaxAmount: value,
        }),
      }),
    },
    {
      fieldKey: "state-local-tax-liability",
      fieldLabel: "Taxes: State & Local",
      yearRowLabel: buildYearRowLabel("Taxes: State & Local"),
      readEraValue: (eraFacts) => eraFacts.expenses.stateLocalTaxLiability,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        expenses: expensesWithSyncedTaxTotal({
          ...eraFacts.expenses,
          stateLocalTaxLiability: value,
        }),
      }),
      readYearValue: (yearInput) =>
        yearInput.expenses.stateLocalTaxLiability,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        expenses: expensesWithSyncedTaxTotal({
          ...yearInput.expenses,
          stateLocalTaxLiability: value,
        }),
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
      fieldKey: "pre-tax-401k-contribution",
      fieldLabel: "Pre-Tax 401(k) / 403(b) Contributions",
      yearRowLabel: buildYearRowLabel(
        "Pre-Tax 401(k) / 403(b) Contributions"
      ),
      readEraValue: (eraFacts) =>
        eraFacts.investmentBreakdown.preTax401kContribution,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        investmentBreakdown: {
          ...eraFacts.investmentBreakdown,
          preTax401kContribution: value,
        },
      }),
      readYearValue: (yearInput) =>
        yearInput.investmentBreakdown.preTax401kContribution,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        investmentBreakdown: {
          ...yearInput.investmentBreakdown,
          preTax401kContribution: value,
        },
      }),
    },
    {
      fieldKey: "pre-tax-ira-contribution",
      fieldLabel: "Traditional IRA Contribution",
      yearRowLabel: buildYearRowLabel("Traditional IRA Contribution"),
      readEraValue: (eraFacts) =>
        eraFacts.investmentBreakdown.preTaxIraContribution,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        investmentBreakdown: {
          ...eraFacts.investmentBreakdown,
          preTaxIraContribution: value,
        },
      }),
      readYearValue: (yearInput) =>
        yearInput.investmentBreakdown.preTaxIraContribution,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        investmentBreakdown: {
          ...yearInput.investmentBreakdown,
          preTaxIraContribution: value,
        },
      }),
    },
    {
      fieldKey: "hsa-contribution",
      fieldLabel: "Health Savings Account (HSA) Contributions",
      yearRowLabel: buildYearRowLabel(
        "Health Savings Account (HSA) Contributions"
      ),
      readEraValue: (eraFacts) => eraFacts.investmentBreakdown.hsaContribution,
      writeEraValue: (eraFacts, value) => ({
        ...eraFacts,
        investmentBreakdown: {
          ...eraFacts.investmentBreakdown,
          hsaContribution: value,
        },
      }),
      readYearValue: (yearInput) =>
        yearInput.investmentBreakdown.hsaContribution,
      writeYearValue: (yearInput, value) => ({
        ...yearInput,
        investmentBreakdown: {
          ...yearInput.investmentBreakdown,
          hsaContribution: value,
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

  return [...wageFields, ...socialSecurityFields, ...otherFields];
}
