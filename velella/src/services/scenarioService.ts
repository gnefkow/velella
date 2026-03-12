import type {
  Scenario,
  ScenarioYaml,
  HouseholdMember,
  YearInput,
} from "../types/scenario";
import { generateMemberId } from "../lib/id";
import { buildDefaultYearInput } from "../lib/yearFacts";

const API_BASE = "/api";

function buildDenseYears(
  yearStart: number,
  yearEnd: number,
  incomeEarnerIds: string[],
  existingByYear: Map<number, YearInput>
): YearInput[] {
  const years: YearInput[] = [];
  for (let y = yearStart; y <= yearEnd; y++) {
    const existing = existingByYear.get(y);
    years.push(buildDefaultYearInput(y, incomeEarnerIds, existing));
  }
  return years;
}

function yamlToScenario(raw: ScenarioYaml): Scenario {
  const si = raw["scenario-info"] ?? {};
  const a = raw.assumptions ?? {};
  const hm = raw["household-members"] ?? [];
  const yearStart = si["year-start"] ?? 2026;
  const yearEnd = si["year-end"] ?? 2076;

  const householdMembers: HouseholdMember[] = hm.map((m) => ({
    id: m.id ?? generateMemberId(),
    nickname: m.nickname ?? "",
    birthday: m.birthday ?? "",
    incomeEarner: m["income-earner"] ?? true,
  }));

  const incomeEarnerIds = householdMembers
    .filter((m) => m.incomeEarner)
    .map((m) => m.id);

  const rawYears = raw.years ?? [];
  const existingByYear = new Map<number, YearInput>();
  for (const yr of rawYears) {
    const y = yr.year ?? yearStart;
    existingByYear.set(y, {
      year: y,
      wageIncome: { ...(yr["wage-income"] ?? {}) },
      otherIncome: {
        dividendIncome: yr["other-income"]?.["dividend-income"] ?? 0,
        interestIncome: yr["other-income"]?.["interest-income"] ?? 0,
        longTermCapitalGains:
          yr["other-income"]?.["long-term-capital-gains"] ?? 0,
        shortTermCapitalGains:
          yr["other-income"]?.["short-term-capital-gains"] ?? 0,
      },
      expenses: {
        householdExpenses: yr.expenses?.["household-expenses"] ?? 0,
        taxes: yr.expenses?.taxes ?? 0,
        otherExpenses: yr.expenses?.["other-expenses"] ?? 0,
      },
    });
  }

  const years = buildDenseYears(
    yearStart,
    yearEnd,
    incomeEarnerIds,
    existingByYear
  );

  return {
    scenarioInfo: {
      scenarioTitle: si["scenario-title"] ?? "",
      scenarioDescription: si["scenario-description"] ?? "",
      yearStart,
      yearEnd,
    },
    assumptions: {
      inflationRate: a["inflation-rate"] ?? 0.03,
      initialPortfolio: a["initial-portfolio"] ?? 1_000_000,
      marketReturn: a["market-return"] ?? a["portfolio-growth-rate"] ?? 0.06,
      safeWithdrawalRate: a["safe-withdrawal-rate"] ?? 0.04,
    },
    householdMembers,
    years,
  };
}

function scenarioToYaml(s: Scenario): ScenarioYaml {
  const incomeEarnerIds = s.householdMembers
    .filter((m) => m.incomeEarner)
    .map((m) => m.id);

  const years = s.years.map((yr) => {
    const wageIncome: Record<string, number> = {};
    for (const id of incomeEarnerIds) {
      wageIncome[id] = yr.wageIncome[id] ?? 0;
    }
    return {
      year: yr.year,
      "wage-income": wageIncome,
      "other-income": {
        "dividend-income": yr.otherIncome.dividendIncome,
        "interest-income": yr.otherIncome.interestIncome,
        "long-term-capital-gains": yr.otherIncome.longTermCapitalGains,
        "short-term-capital-gains": yr.otherIncome.shortTermCapitalGains,
      },
      expenses: {
        "household-expenses": yr.expenses.householdExpenses,
        taxes: yr.expenses.taxes,
        "other-expenses": yr.expenses.otherExpenses,
      },
    };
  });

  return {
    "scenario-info": {
      "scenario-title": s.scenarioInfo.scenarioTitle,
      "scenario-description": s.scenarioInfo.scenarioDescription,
      "year-start": s.scenarioInfo.yearStart,
      "year-end": s.scenarioInfo.yearEnd,
    },
    assumptions: {
      "inflation-rate": s.assumptions.inflationRate,
      "initial-portfolio": s.assumptions.initialPortfolio,
      "market-return": s.assumptions.marketReturn,
      "safe-withdrawal-rate": s.assumptions.safeWithdrawalRate,
    },
    "household-members": s.householdMembers.map((m) => ({
      id: m.id,
      nickname: m.nickname,
      birthday: m.birthday,
      "income-earner": m.incomeEarner,
    })),
    years,
  };
}

export async function loadScenario(): Promise<Scenario> {
  const res = await fetch(`${API_BASE}/scenario`);
  if (!res.ok) throw new Error(`Failed to load scenario: ${res.status}`);
  const raw = (await res.json()) as ScenarioYaml;
  return yamlToScenario(raw);
}

/**
 * Rebuilds years when year-start or year-end changes.
 * Preserves overlapping years; adds new years with defaults; drops out-of-range.
 */
export function rebuildYearsForRange(
  scenario: Scenario,
  newYearStart: number,
  newYearEnd: number
): YearInput[] {
  const incomeEarnerIds = scenario.householdMembers
    .filter((m) => m.incomeEarner)
    .map((m) => m.id);
  const existingByYear = new Map(
    scenario.years.map((yr) => [yr.year, yr])
  );
  return buildDenseYears(
    newYearStart,
    newYearEnd,
    incomeEarnerIds,
    existingByYear
  );
}

export async function saveScenario(scenario: Scenario): Promise<void> {
  const body = scenarioToYaml(scenario);
  const res = await fetch(`${API_BASE}/scenario`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to save scenario: ${res.status}`);
}
