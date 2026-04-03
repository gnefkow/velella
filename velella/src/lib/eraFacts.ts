import type { EraFacts } from "../types/era";
import type { YearInput } from "../types/scenario";
import { DEFAULT_FILING_STATUS } from "./filingStatus";
import { expensesWithSyncedTaxTotal } from "./yearFacts";

/** Builds default era facts from income earner IDs. */
export function buildDefaultEraFacts(
  incomeEarnerIds: string[],
  existing?: Partial<EraFacts>
): EraFacts {
  const wageIncome: Record<string, number> = {};
  const socialSecurityBenefits: Record<string, number> = {};
  for (const id of incomeEarnerIds) {
    wageIncome[id] = existing?.wageIncome?.[id] ?? 0;
    socialSecurityBenefits[id] =
      existing?.socialSecurityBenefits?.[id] ?? 0;
  }
  return {
    filingStatus: existing?.filingStatus ?? DEFAULT_FILING_STATUS,
    wageIncome,
    socialSecurityBenefits,
    otherIncome: {
      preTaxDistributions: existing?.otherIncome?.preTaxDistributions ?? 0,
      rothDistributions: existing?.otherIncome?.rothDistributions ?? 0,
      qualifiedDividends: existing?.otherIncome?.qualifiedDividends ?? 0,
      ordinaryDividends: existing?.otherIncome?.ordinaryDividends ?? 0,
      interestIncome: existing?.otherIncome?.interestIncome ?? 0,
      longTermCapitalGains: existing?.otherIncome?.longTermCapitalGains ?? 0,
      shortTermCapitalGains: existing?.otherIncome?.shortTermCapitalGains ?? 0,
    },
    misc: {
      rothConversions: existing?.misc?.rothConversions ?? 0,
    },
    expenses: expensesWithSyncedTaxTotal({
      householdExpenses: existing?.expenses?.householdExpenses ?? 0,
      selectedFederalTaxAmount:
        existing?.expenses?.selectedFederalTaxAmount ?? 0,
      federalTaxSource: existing?.expenses?.federalTaxSource ?? "manual",
      stateLocalTaxLiability:
        existing?.expenses?.stateLocalTaxLiability ?? 0,
      taxes: 0,
      otherExpenses: existing?.expenses?.otherExpenses ?? 0,
    }),
    modifyInvestmentDetails: existing?.modifyInvestmentDetails ?? false,
    investmentBreakdown: {
      preTax401kContribution:
        existing?.investmentBreakdown?.preTax401kContribution ?? 0,
      preTaxIraContribution:
        existing?.investmentBreakdown?.preTaxIraContribution ?? 0,
      hsaContribution:
        existing?.investmentBreakdown?.hsaContribution ?? 0,
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

  const socialSecurityBenefits: Record<string, number> = {};
  const yearSs = yearInput.socialSecurityBenefits ?? {};
  const eraSs = eraFacts.socialSecurityBenefits ?? {};
  for (const [id] of Object.entries(yearSs)) {
    const fieldKey = `social-security-benefits-${id}`;
    socialSecurityBenefits[id] = isOverridden(fieldKey)
      ? yearSs[id] ?? 0
      : eraSs[id] ?? 0;
  }
  for (const id of Object.keys(eraSs)) {
    if (!(id in socialSecurityBenefits)) {
      const fieldKey = `social-security-benefits-${id}`;
      socialSecurityBenefits[id] = isOverridden(fieldKey)
        ? yearSs[id] ?? 0
        : eraSs[id] ?? 0;
    }
  }

  return {
    ...yearInput,
    filingStatus: isOverridden("filing-status")
      ? yearInput.filingStatus
      : eraFacts.filingStatus,
    wageIncome,
    socialSecurityBenefits,
    otherIncome: {
      preTaxDistributions: isOverridden("pre-tax-distributions")
        ? yearInput.otherIncome.preTaxDistributions
        : eraFacts.otherIncome.preTaxDistributions,
      rothDistributions: isOverridden("roth-distributions")
        ? yearInput.otherIncome.rothDistributions
        : eraFacts.otherIncome.rothDistributions,
      qualifiedDividends: isOverridden("qualified-dividends")
        ? yearInput.otherIncome.qualifiedDividends
        : eraFacts.otherIncome.qualifiedDividends,
      ordinaryDividends: isOverridden("ordinary-dividends")
        ? yearInput.otherIncome.ordinaryDividends
        : eraFacts.otherIncome.ordinaryDividends,
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
    misc: {
      rothConversions: isOverridden("roth-conversions")
        ? yearInput.misc.rothConversions
        : eraFacts.misc.rothConversions,
    },
    expenses: expensesWithSyncedTaxTotal({
      householdExpenses: isOverridden("household-expenses")
        ? yearInput.expenses.householdExpenses
        : eraFacts.expenses.householdExpenses,
      selectedFederalTaxAmount: isOverridden(
        "selected-federal-tax-amount"
      )
        ? yearInput.expenses.selectedFederalTaxAmount
        : eraFacts.expenses.selectedFederalTaxAmount,
      federalTaxSource: eraFacts.expenses.federalTaxSource,
      stateLocalTaxLiability: isOverridden("state-local-tax-liability")
        ? yearInput.expenses.stateLocalTaxLiability
        : eraFacts.expenses.stateLocalTaxLiability,
      taxes: 0,
      otherExpenses: isOverridden("other-expenses")
        ? yearInput.expenses.otherExpenses
        : eraFacts.expenses.otherExpenses,
    }),
    modifyInvestmentDetails: isOverridden("modify-investment-details")
      ? yearInput.modifyInvestmentDetails
      : eraFacts.modifyInvestmentDetails,
    investmentBreakdown: {
      preTax401kContribution: isOverridden("pre-tax-401k-contribution")
        ? yearInput.investmentBreakdown.preTax401kContribution
        : eraFacts.investmentBreakdown.preTax401kContribution,
      preTaxIraContribution: isOverridden("pre-tax-ira-contribution")
        ? yearInput.investmentBreakdown.preTaxIraContribution
        : eraFacts.investmentBreakdown.preTaxIraContribution,
      hsaContribution: isOverridden("hsa-contribution")
        ? yearInput.investmentBreakdown.hsaContribution
        : eraFacts.investmentBreakdown.hsaContribution,
      rothRetirement: isOverridden("roth-retirement")
        ? yearInput.investmentBreakdown.rothRetirement
        : eraFacts.investmentBreakdown.rothRetirement,
      taxableInvestments: isOverridden("taxable-investments")
        ? yearInput.investmentBreakdown.taxableInvestments
        : eraFacts.investmentBreakdown.taxableInvestments,
    },
  };
}
