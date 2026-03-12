import type { Scenario } from "../types/scenario";
import type { Year } from "../types/year";
import { calculateYearFacts } from "../lib/yearFacts";

/**
 * Calculates the timeline of years with portfolio amounts.
 * Uses real (inflation-adjusted) dollars.
 * real-return-factor = (1 + marketReturn) / (1 + inflationRate)
 *
 * For each year:
 *   cashChange = totalIncome - totalExpenses
 *   portfolioEnd = (portfolioBeg * realReturnFactor) + cashChange
 *   next year's portfolioBeg = this year's portfolioEnd
 */

export function calculateTimeline(scenario: Scenario): Year[] {
  const { yearStart, yearEnd } = scenario.scenarioInfo;
  const { initialPortfolio, inflationRate, marketReturn } = scenario.assumptions;
  const yearInputsByYear = new Map(scenario.years.map((yearInput) => [yearInput.year, yearInput]));

  const realReturnFactor = (1 + marketReturn) / (1 + inflationRate);

  const years: Year[] = [];
  const numYears = yearEnd - yearStart;

  let portfolioBeg = initialPortfolio;

  for (let i = 0; i <= numYears; i++) {
    const year = yearStart + i;
    const yearInput = yearInputsByYear.get(year);
    const { totalIncome, totalExpenses } = calculateYearFacts(yearInput);
    const cashChange = totalIncome - totalExpenses;

    const portfolioEnd = portfolioBeg * realReturnFactor + cashChange;
    const cPop =
      portfolioEnd > 0 ? totalExpenses / portfolioEnd : null;

    years.push({
      yearNum: i,
      year,
      portfolioBeg,
      totalIncome,
      totalExpenses,
      cashChange,
      portfolioEnd,
      cPop,
    });

    portfolioBeg = portfolioEnd;
  }

  return years;
}
