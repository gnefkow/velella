/**
 * A single year in the calculated timeline.
 * All values are in real (inflation-adjusted) dollars.
 */
export interface Year {
  yearNum: number;
  year: number;
  portfolioBeg: number;
  totalIncome: number;
  totalExpenses: number;
  /** Income minus expenses (cash available before a custom invest choice). */
  availableToInvest: number;
  /** Amount flowing into the portfolio this year (respects modify-invest toggle). */
  invest: number;
  portfolioEnd: number;
  /** Cost Percent of Portfolio: expenses / portfolioEnd. Null when portfolioEnd <= 0. */
  cPop: number | null;
}
