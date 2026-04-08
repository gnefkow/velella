import type { YearInput } from "../types/scenario";
import type { FederalTaxSource } from "../types/tax";
import type { TaxEstimatorReferenceData } from "../types/taxReferenceData";
import type { TaxEstimateResult } from "../types/taxEstimate";
import { estimateTax } from "../engine/estimateTax";
import { DEFAULT_FILING_STATUS } from "./filingStatus";

/** Fallback when estimate mode is on but tax reference data is missing or engine fails. */
export const ESTIMATED_FEDERAL_TAX_EXPENSE = 9_999_999;

type TaxExpenseInput = Omit<
  YearInput["expenses"],
  "taxes" | "federalTaxSource"
> &
  Partial<Pick<YearInput["expenses"], "taxes" | "federalTaxSource">>;

export function effectiveFederalTaxAmount(
  selectedFederalTaxAmount: number,
  federalTaxSource: FederalTaxSource
): number {
  return federalTaxSource === "use-estimate"
    ? ESTIMATED_FEDERAL_TAX_EXPENSE
    : selectedFederalTaxAmount;
}

/** Federal amount used in live year math when estimate mode is on. */
export function federalTaxAmountForYearInput(
  yearInput: YearInput | undefined,
  taxEstimatorRef?: TaxEstimatorReferenceData | null
): number {
  if (!yearInput) return 0;
  const source = yearInput.expenses.federalTaxSource ?? "manual";
  if (source !== "use-estimate") {
    return yearInput.expenses.selectedFederalTaxAmount ?? 0;
  }
  if (!taxEstimatorRef) {
    return ESTIMATED_FEDERAL_TAX_EXPENSE;
  }
  return estimateTax(yearInput, taxEstimatorRef).estimatedFederalTaxExpense;
}

export function totalTaxExpenseForYearInput(
  yearInput: YearInput | undefined,
  taxEstimatorRef?: TaxEstimatorReferenceData | null
): number {
  return (
    federalTaxAmountForYearInput(yearInput, taxEstimatorRef) +
    (yearInput?.expenses.stateLocalTaxLiability ?? 0)
  );
}

/** Breakdown for the estimate-details modal; null when not in estimate mode or no ref. */
export function federalTaxEstimateBreakdown(
  yearInput: YearInput | undefined,
  taxEstimatorRef?: TaxEstimatorReferenceData | null
): TaxEstimateResult | null {
  if (
    !yearInput ||
    (yearInput.expenses.federalTaxSource ?? "manual") !== "use-estimate" ||
    !taxEstimatorRef
  ) {
    return null;
  }
  return estimateTax(yearInput, taxEstimatorRef);
}

/** Combined tax expense used by year math; always federal + state/local. */
export function totalTaxExpenseFromParts(
  selectedFederalTaxAmount: number,
  stateLocalTaxLiability: number,
  federalTaxSource: FederalTaxSource = "manual"
): number {
  return (
    effectiveFederalTaxAmount(selectedFederalTaxAmount, federalTaxSource) +
    stateLocalTaxLiability
  );
}

export function defaultFederalTaxSourceForYears(
  yearInputs: Array<Pick<YearInput, "expenses">>
): FederalTaxSource {
  if (yearInputs.length === 0) {
    return "manual";
  }

  return yearInputs.every(
    (yearInput) => yearInput.expenses.selectedFederalTaxAmount === 0
  )
    ? "use-estimate"
    : "manual";
}

export function expensesWithSyncedTaxTotal(
  expenses: TaxExpenseInput
): YearInput["expenses"] {
  const federalTaxSource = expenses.federalTaxSource ?? "manual";
  return {
    ...expenses,
    federalTaxSource,
    taxes: totalTaxExpenseFromParts(
      expenses.selectedFederalTaxAmount,
      expenses.stateLocalTaxLiability,
      federalTaxSource
    ),
  };
}

export interface CalculatedYearFacts {
  ordinaryIncome: number;
  totalIncome: number;
  totalExpenses: number;
  /** Federal + state/local tax used in totalExpenses (live estimate when applicable). */
  totalTaxExpense: number;
}

export function buildDefaultYearInput(
  year: number,
  incomeEarnerIds: string[],
  existing?: Partial<YearInput>
): YearInput {
  const wageIncome: Record<string, number> = {};
  const socialSecurityBenefits: Record<string, number> = {};

  for (const id of incomeEarnerIds) {
    wageIncome[id] = existing?.wageIncome?.[id] ?? 0;
    socialSecurityBenefits[id] =
      existing?.socialSecurityBenefits?.[id] ?? 0;
  }

  const result: YearInput = {
    year,
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
  if (existing?.eraMetadata) {
    result.eraMetadata = existing.eraMetadata;
  }
  return result;
}

export function calculateYearFacts(
  yearInput?: YearInput,
  taxEstimatorRef?: TaxEstimatorReferenceData | null
): CalculatedYearFacts {
  const wageIncome = Object.values(yearInput?.wageIncome ?? {}).reduce(
    (sum, value) => sum + (value ?? 0),
    0
  );
  const socialSecurityBenefits = Object.values(
    yearInput?.socialSecurityBenefits ?? {}
  ).reduce((sum, value) => sum + (value ?? 0), 0);
  const qualifiedDividends = yearInput?.otherIncome.qualifiedDividends ?? 0;
  const ordinaryDividends = yearInput?.otherIncome.ordinaryDividends ?? 0;
  const preTaxDistributions =
    yearInput?.otherIncome.preTaxDistributions ?? 0;
  const interestIncome = yearInput?.otherIncome.interestIncome ?? 0;
  const shortTermCapitalGains =
    yearInput?.otherIncome.shortTermCapitalGains ?? 0;
  const longTermCapitalGains =
    yearInput?.otherIncome.longTermCapitalGains ?? 0;
  const rothDistributions =
    yearInput?.otherIncome.rothDistributions ?? 0;
  const householdExpenses = yearInput?.expenses.householdExpenses ?? 0;
  const otherExpenses = yearInput?.expenses.otherExpenses ?? 0;

  // Until the tax engine differentiates rates, both dividend types roll into ordinary income.
  const ordinaryIncome =
    wageIncome +
    socialSecurityBenefits +
    preTaxDistributions +
    qualifiedDividends +
    ordinaryDividends +
    interestIncome +
    shortTermCapitalGains;
  // Roth distributions are cash inflow in V1 but excluded from ordinaryIncome (non-taxable qualified).
  const totalIncome =
    ordinaryIncome + longTermCapitalGains + rothDistributions;
  const totalTaxExpense = totalTaxExpenseForYearInput(
    yearInput,
    taxEstimatorRef
  );
  const totalExpenses = householdExpenses + totalTaxExpense + otherExpenses;

  return {
    ordinaryIncome,
    totalIncome,
    totalExpenses,
    totalTaxExpense,
  };
}
