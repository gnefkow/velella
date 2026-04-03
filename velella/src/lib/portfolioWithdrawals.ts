import type { YearInput } from "../types/scenario";

/**
 * Portfolio cash pulled out at the start of the year for timeline engine math.
 * Short/long-term capital gain fields are treated as total sale proceeds for V1
 * (see ticket 032).
 */
export function portfolioWithdrawalsFromYearInput(
  yearInput?: YearInput
): number {
  const o = yearInput?.otherIncome;
  if (!o) return 0;
  return (
    (o.preTaxDistributions ?? 0) +
    (o.rothDistributions ?? 0) +
    (o.shortTermCapitalGains ?? 0) +
    (o.longTermCapitalGains ?? 0)
  );
}
