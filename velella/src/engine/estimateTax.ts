import type { YearInput } from "../types/scenario";
import type { TaxEstimatorReferenceData } from "../types/taxReferenceData";
import type { TaxEstimateResult } from "../types/taxEstimate";
import { taxFromOrdinaryBrackets, taxFromPreferentialStacked } from "./tax/applyTaxBrackets";
import { estimateTaxableSocialSecurityBenefits } from "./tax/estimateTaxableSocialSecurity";
import {
  REALIZED_GAIN_TAXABLE_FRACTION,
  taxableGainPortionFromRealizedAmount,
} from "./tax/gainsBasis";

function sumWages(wageIncome: Record<string, number> | undefined): number {
  return Object.values(wageIncome ?? {}).reduce((s, v) => s + (v ?? 0), 0);
}

function sumSocialSecurity(
  socialSecurityBenefits: Record<string, number> | undefined
): number {
  return Object.values(socialSecurityBenefits ?? {}).reduce(
    (s, v) => s + (v ?? 0),
    0
  );
}

function preTaxContributionTotal(yearInput: YearInput): number {
  if (!yearInput.modifyInvestmentDetails) {
    return 0;
  }
  const b = yearInput.investmentBreakdown;
  return (
    (b.preTax401kContribution ?? 0) +
    (b.preTaxIraContribution ?? 0) +
    (b.hsaContribution ?? 0)
  );
}

function allocateStandardDeduction(
  ordinaryIncome: number,
  preferentialIncome: number,
  standardDeduction: number
): { ordinaryTaxable: number; preferentialTaxable: number } {
  const o = ordinaryIncome;
  const p = preferentialIncome;
  const ded = standardDeduction;
  const ordinaryTaxable = Math.max(0, o - Math.min(ded, o));
  const preferentialTaxable = Math.max(0, p - Math.max(0, ded - o));
  return { ordinaryTaxable, preferentialTaxable };
}

/**
 * Federal income tax estimate for one year. Child Tax Credit is intentionally
 * omitted in V1 (see design debt). Does not include state/local tax.
 */
export function estimateTax(
  yearInput: YearInput,
  ref: TaxEstimatorReferenceData
): TaxEstimateResult {
  const notes: string[] = [
    "Federal estimate only; state and local tax are entered separately.",
    "Child Tax Credit is not applied in this version.",
    `Realized short/long-term sale amounts use ${
      REALIZED_GAIN_TAXABLE_FRACTION * 100
    }% as taxable gain (50% basis assumption).`,
  ];

  const filingStatus = yearInput.filingStatus;
  if (!ref.supportedFilingStatuses.includes(filingStatus)) {
    notes.push(`Unsupported filing status for estimator; using single tables.`);
  }
  const statusKey = ref.supportedFilingStatuses.includes(filingStatus)
    ? filingStatus
    : ref.supportedFilingStatuses[0] ?? "single";

  const wageIncomeTotal = sumWages(yearInput.wageIncome);
  const grossSocialSecurityTotal = sumSocialSecurity(
    yearInput.socialSecurityBenefits
  );
  const oi = yearInput.otherIncome;
  const ordinaryDividends = oi.ordinaryDividends ?? 0;
  const qualifiedDividends = oi.qualifiedDividends ?? 0;
  const interestIncome = oi.interestIncome ?? 0;
  const shortTermRaw = oi.shortTermCapitalGains ?? 0;
  const longTermRaw = oi.longTermCapitalGains ?? 0;
  const shortTermTaxable = taxableGainPortionFromRealizedAmount(shortTermRaw);
  const longTermTaxable = taxableGainPortionFromRealizedAmount(longTermRaw);
  const preTaxDistributions = oi.preTaxDistributions ?? 0;
  const rothConversions = yearInput.misc?.rothConversions ?? 0;
  const preTaxContribution = preTaxContributionTotal(yearInput);

  const ordinaryIncomeBeforeSS =
    wageIncomeTotal +
    ordinaryDividends +
    interestIncome +
    shortTermTaxable +
    preTaxDistributions +
    rothConversions -
    preTaxContribution;

  const provisionalIncome =
    ordinaryIncomeBeforeSS +
    longTermTaxable +
    qualifiedDividends +
    0.5 * grossSocialSecurityTotal;

  const ssThreshold = ref.socialSecurityTaxation.thresholdsByFilingStatus[statusKey];
  const taxableSocialSecurity = estimateTaxableSocialSecurityBenefits(
    grossSocialSecurityTotal,
    provisionalIncome,
    ssThreshold
  );

  const ordinaryIncome = ordinaryIncomeBeforeSS + taxableSocialSecurity;
  const preferentialIncome = qualifiedDividends + longTermTaxable;
  const adjustedGrossIncome = ordinaryIncome + preferentialIncome;

  const standardDeduction = ref.standardDeductionByFilingStatus[statusKey] ?? 0;
  const taxableIncome = Math.max(0, adjustedGrossIncome - standardDeduction);

  const { ordinaryTaxable, preferentialTaxable } = allocateStandardDeduction(
    ordinaryIncome,
    preferentialIncome,
    standardDeduction
  );

  const ordinaryBrackets = ref.ordinaryIncomeBracketsByFilingStatus[statusKey] ?? [];
  const preferentialBrackets =
    ref.preferentialIncomeBracketsByFilingStatus[statusKey] ?? [];

  const ordinaryTax = taxFromOrdinaryBrackets(ordinaryTaxable, ordinaryBrackets);
  const preferentialTax = taxFromPreferentialStacked(
    ordinaryTaxable,
    preferentialTaxable,
    preferentialBrackets
  );

  const grossFederalTaxLiability = Math.max(
    0,
    ordinaryTax + preferentialTax
  );

  return {
    estimatedFederalTaxExpense: grossFederalTaxLiability,
    ordinaryIncomeBeforeSS,
    provisionalIncome,
    grossSocialSecurity: grossSocialSecurityTotal,
    taxableSocialSecurity,
    ordinaryIncome,
    preferentialIncome,
    adjustedGrossIncome,
    standardDeduction,
    taxableIncome,
    ordinaryTaxableAfterDeduction: ordinaryTaxable,
    preferentialTaxableAfterDeduction: preferentialTaxable,
    ordinaryTax,
    preferentialTax,
    grossFederalTaxLiability,
    notes,
  };
}
