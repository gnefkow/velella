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
  cashChange: number;
  portfolioEnd: number;
  /** Cost Percent of Portfolio: expenses / portfolioEnd. Null when portfolioEnd <= 0. */
  cPop: number | null;
}
