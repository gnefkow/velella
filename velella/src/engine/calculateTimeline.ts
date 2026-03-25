import type { Scenario } from "../types/scenario";
import type { Year } from "../types/year";
import { buildDefaultYearInput, calculateYearFacts } from "../lib/yearFacts";
import { effectiveInvestFromYearInput } from "../lib/invest";

/**
 * Calculates the timeline of years with portfolio amounts.
 * Uses real (inflation-adjusted) dollars.
 * real-return-factor = (1 + marketReturn) / (1 + inflationRate)
 *
 * For each year:
 *   availableToInvest = totalIncome - totalExpenses
 *   invest = effective contribution (custom or available)
 *   portfolioEnd = (portfolioBeg * realReturnFactor) + invest
 *   next year's portfolioBeg = this year's portfolioEnd
 */

export function calculateTimeline(scenario: Scenario): Year[] {
  const { yearStart, yearEnd } = scenario.scenarioInfo;
  const { initialPortfolio, inflationRate, marketReturn } = scenario.assumptions;
  const yearInputsByYear = new Map(scenario.years.map((yearInput) => [yearInput.year, yearInput]));
  const incomeEarnerIds = scenario.householdMembers
    .filter((m) => m.incomeEarner)
    .map((m) => m.id);

  const realReturnFactor = (1 + marketReturn) / (1 + inflationRate);

  const years: Year[] = [];
  const numYears = yearEnd - yearStart;

  let portfolioBeg = initialPortfolio;

  for (let i = 0; i <= numYears; i++) {
    const year = yearStart + i;
    const yearInput =
      yearInputsByYear.get(year) ??
      buildDefaultYearInput(year, incomeEarnerIds);
    const { totalIncome, totalExpenses } = calculateYearFacts(yearInput);
    const availableToInvest = totalIncome - totalExpenses;
    const invest = effectiveInvestFromYearInput(yearInput);

    const portfolioEnd = portfolioBeg * realReturnFactor + invest;
    const cPop =
      portfolioEnd > 0 ? totalExpenses / portfolioEnd : null;

    years.push({
      yearNum: i,
      year,
      portfolioBeg,
      totalIncome,
      totalExpenses,
      availableToInvest,
      invest,
      portfolioEnd,
      cPop,
    });

    portfolioBeg = portfolioEnd;
  }

  return years;
}
