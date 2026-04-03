import type { YearInput } from "../types/scenario";
import type { FederalTaxSource } from "../types/tax";
import { DEFAULT_FILING_STATUS } from "./filingStatus";

export const ESTIMATED_FEDERAL_TAX_EXPENSE = 9_999;

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

export function calculateYearFacts(yearInput?: YearInput): CalculatedYearFacts {
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
  const taxes = yearInput?.expenses.taxes ?? 0;
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
  const totalExpenses = householdExpenses + taxes + otherExpenses;

  return {
    ordinaryIncome,
    totalIncome,
    totalExpenses,
  };
}
