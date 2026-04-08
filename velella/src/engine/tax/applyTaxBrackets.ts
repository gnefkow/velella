import type { TaxBracket } from "../../types/taxReferenceData";

/** Progressive ordinary-income tax on positive taxable income. */
export function taxFromOrdinaryBrackets(
  taxableIncome: number,
  brackets: TaxBracket[]
): number {
  if (taxableIncome <= 0) return 0;
  let tax = 0;
  for (const br of brackets) {
    const start = br.lowerBound;
    const end = br.upperBound ?? Number.POSITIVE_INFINITY;
    const overlapHigh = Math.min(taxableIncome, end);
    const width = Math.max(0, overlapHigh - start);
    if (width > 0) {
      tax += width * br.rate;
    }
  }
  return tax;
}

/**
 * Preferential (LTCG / qualified dividend) tax with ordinary taxable income
 * stacking into preferential bracket thresholds.
 */
export function taxFromPreferentialStacked(
  ordinaryTaxableIncome: number,
  preferentialTaxableIncome: number,
  preferentialBrackets: TaxBracket[]
): number {
  if (preferentialTaxableIncome <= 0) return 0;
  let tax = 0;
  let remaining = preferentialTaxableIncome;
  let stackTop = ordinaryTaxableIncome;

  for (const br of preferentialBrackets) {
    if (remaining <= 0) break;
    const lo = br.lowerBound;
    const hi = br.upperBound ?? Number.POSITIVE_INFINITY;
    if (stackTop >= hi) continue;
    const spaceInBracket = hi - Math.max(stackTop, lo);
    const take = Math.min(remaining, spaceInBracket);
    if (take > 0) {
      tax += take * br.rate;
      remaining -= take;
      stackTop += take;
    }
  }

  return tax;
}
