import { describe, expect, it } from "vitest";
import type { Scenario, YearInput } from "../types/scenario";
import { portfolioWithdrawalsFromYearInput } from "../lib/portfolioWithdrawals";
import { calculateTimeline } from "./calculateTimeline";

/** Minimal year input: zero invest via breakdown, balanced cash flow so automatic path stays off. */
function makeYear(year: number, over: Partial<YearInput> = {}): YearInput {
  return {
    year,
    filingStatus: over.filingStatus ?? "single",
    wageIncome: over.wageIncome ?? { m1: 50_000 },
    socialSecurityBenefits: over.socialSecurityBenefits ?? { m1: 0 },
    otherIncome: {
      preTaxDistributions: 0,
      rothDistributions: 0,
      qualifiedDividends: 0,
      ordinaryDividends: 0,
      interestIncome: 0,
      longTermCapitalGains: 0,
      shortTermCapitalGains: 0,
      ...over.otherIncome,
    },
    misc: over.misc ?? { rothConversions: 0 },
    expenses: {
      householdExpenses: 50_000,
      selectedFederalTaxAmount: 0,
      federalTaxSource: "manual",
      stateLocalTaxLiability: 0,
      taxes: 0,
      otherExpenses: 0,
      ...over.expenses,
    },
    modifyInvestmentDetails: over.modifyInvestmentDetails ?? true,
    investmentBreakdown: {
      preTax401kContribution: 0,
      preTaxIraContribution: 0,
      hsaContribution: 0,
      rothRetirement: 0,
      taxableInvestments: 0,
      ...over.investmentBreakdown,
    },
    eraMetadata: over.eraMetadata,
  };
}

function baseScenario(years: YearInput[]): Scenario {
  const start = years[0]?.year ?? 2026;
  const end = years[years.length - 1]?.year ?? start;
  return {
    scenarioInfo: {
      scenarioTitle: "T",
      scenarioDescription: "",
      yearStart: start,
      yearEnd: end,
    },
    assumptions: {
      inflationRate: 0,
      initialPortfolio: 1_000_000,
      marketReturn: 0.1,
      safeWithdrawalRate: 0.04,
    },
    householdMembers: [
      {
        id: "m1",
        nickname: "M1",
        birthday: "01/01/1970",
        incomeEarner: true,
      },
    ],
    years,
  };
}

describe("calculateTimeline", () => {
  it("matches legacy behavior when withdrawals are zero", () => {
    const yi = makeYear(2026);
    const s = baseScenario([yi]);
    const timeline = calculateTimeline(s);
    const y = timeline[0];
    expect(y).toBeDefined();
    // realReturnFactor = 1.1, no withdrawals, invest 0
    expect(y!.portfolioEnd).toBe(1_000_000 * 1.1);
    const w = portfolioWithdrawalsFromYearInput(yi);
    expect(y!.investDivestNet).toBe(y!.invest - w);
  });

  it("subtracts pre-tax and Roth distributions before growth (Option B)", () => {
    const yi = makeYear(2026, {
      otherIncome: {
        qualifiedDividends: 0,
        ordinaryDividends: 0,
        interestIncome: 0,
        longTermCapitalGains: 0,
        preTaxDistributions: 60_000,
        rothDistributions: 40_000,
        shortTermCapitalGains: 0,
      },
    });
    const s = baseScenario([yi]);
    const timeline = calculateTimeline(s);
    const y = timeline[0];
    // (1M - 100k) * 1.1 + 0 = 990_000 — not 1M * 1.1 - 100k = 1_000_000 (Option A)
    expect(y!.portfolioEnd).toBeCloseTo(990_000, 5);
    const w = portfolioWithdrawalsFromYearInput(yi);
    expect(w).toBe(100_000);
    expect(y!.investDivestNet).toBe(y!.invest - w);
  });

  it("includes short-term and long-term fields in withdrawals", () => {
    const s = baseScenario([
      makeYear(2026, {
        otherIncome: {
          preTaxDistributions: 0,
          rothDistributions: 0,
          qualifiedDividends: 0,
          ordinaryDividends: 0,
          interestIncome: 0,
          shortTermCapitalGains: 25_000,
          longTermCapitalGains: 25_000,
        },
      }),
    ]);
    const timeline = calculateTimeline(s);
    expect(timeline[0]!.portfolioEnd).toBeCloseTo((1_000_000 - 50_000) * 1.1, 5);
  });

  it("carries reduced balance to the next year", () => {
    const s = baseScenario([
      makeYear(2026, {
        otherIncome: {
          preTaxDistributions: 100_000,
          rothDistributions: 0,
          qualifiedDividends: 0,
          ordinaryDividends: 0,
          interestIncome: 0,
          longTermCapitalGains: 0,
          shortTermCapitalGains: 0,
        },
      }),
      makeYear(2027),
    ]);
    const timeline = calculateTimeline(s);
    expect(timeline[0]!.portfolioEnd).toBeCloseTo(990_000, 5);
    expect(timeline[1]!.portfolioBeg).toBeCloseTo(990_000, 5);
  });
});
