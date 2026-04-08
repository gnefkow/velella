/** Derived output of the federal tax estimator (not persisted). */
export interface TaxEstimateResult {
  estimatedFederalTaxExpense: number;
  ordinaryIncomeBeforeSS: number;
  provisionalIncome: number;
  grossSocialSecurity: number;
  taxableSocialSecurity: number;
  ordinaryIncome: number;
  preferentialIncome: number;
  adjustedGrossIncome: number;
  standardDeduction: number;
  taxableIncome: number;
  ordinaryTaxableAfterDeduction: number;
  preferentialTaxableAfterDeduction: number;
  ordinaryTax: number;
  preferentialTax: number;
  grossFederalTaxLiability: number;
  /** Short notes shown in the estimate breakdown UI. */
  notes: string[];
}
