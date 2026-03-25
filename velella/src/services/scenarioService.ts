import type {
  Scenario,
  ScenarioYaml,
  HouseholdMember,
  YearInput,
} from "../types/scenario";
import type { Era } from "../types/era";
import { generateMemberId } from "../lib/id";
import { buildDefaultYearInput } from "../lib/yearFacts";
import type { InvestmentBreakdown } from "../types/investment";

const API_BASE = "/api";

export interface ScenarioSummary {
  id: string;
  label: string;
}

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

function parseInvestmentBreakdown(
  rawBreakdown:
    | {
        "traditional-retirement"?: number;
        "roth-retirement"?: number;
        "taxable-investments"?: number;
      }
    | undefined,
  legacyInvest = 0
): InvestmentBreakdown {
  if (rawBreakdown) {
    return {
      traditionalRetirement: rawBreakdown["traditional-retirement"] ?? 0,
      rothRetirement: rawBreakdown["roth-retirement"] ?? 0,
      taxableInvestments: rawBreakdown["taxable-investments"] ?? 0,
    };
  }

  return {
    traditionalRetirement: 0,
    rothRetirement: 0,
    taxableInvestments: legacyInvest,
  };
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
    const eraMeta = yr["era-metadata"];
    const modifyInvestmentDetails = yr["modify-investment-details"] ?? false;
    const investmentBreakdown = parseInvestmentBreakdown(
      yr["investment-breakdown"],
      modifyInvestmentDetails ? (yr.invest ?? 0) : 0
    );
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
      modifyInvestmentDetails,
      investmentBreakdown,
      eraMetadata: eraMeta
        ? {
            eraId: eraMeta["era-id"] ?? "",
            overriddenFields: eraMeta["overridden-fields"] ?? [],
          }
        : undefined,
    });
  }

  const years = buildDenseYears(
    yearStart,
    yearEnd,
    incomeEarnerIds,
    existingByYear
  );

  const rawEras = raw.eras ?? [];
  const eras: Era[] = rawEras.map((er) => {
    const ef = er["era-facts"];
    const eraModify = ef?.["modify-investment-details"] ?? false;
    const investmentBreakdown = parseInvestmentBreakdown(
      ef?.["investment-breakdown"],
      eraModify ? (ef?.invest ?? 0) : 0
    );
    return {
      id: er.id ?? "",
      nickname: er.nickname ?? "",
      description: er.description ?? "",
      startYear: er["start-year"] ?? yearStart,
      endYear: er["end-year"] ?? yearEnd,
      eraFacts: {
        wageIncome: ef?.["wage-income"] ?? {},
        otherIncome: {
          dividendIncome: ef?.["other-income"]?.["dividend-income"] ?? 0,
          interestIncome: ef?.["other-income"]?.["interest-income"] ?? 0,
          longTermCapitalGains: ef?.["other-income"]?.["long-term-capital-gains"] ?? 0,
          shortTermCapitalGains: ef?.["other-income"]?.["short-term-capital-gains"] ?? 0,
        },
        expenses: {
          householdExpenses: ef?.expenses?.["household-expenses"] ?? 0,
          taxes: ef?.expenses?.taxes ?? 0,
          otherExpenses: ef?.expenses?.["other-expenses"] ?? 0,
        },
        modifyInvestmentDetails: eraModify,
        investmentBreakdown,
      },
    };
  });

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
    eras,
  };
}

function scenarioToYaml(s: Scenario): ScenarioYaml {
  const incomeEarnerIds = s.householdMembers
    .filter((m) => m.incomeEarner)
    .map((m) => m.id);

  type YamlYear = NonNullable<ScenarioYaml["years"]>[number];

  const years: YamlYear[] = s.years.map((yr) => {
    const wageIncome: Record<string, number> = {};
    for (const id of incomeEarnerIds) {
      wageIncome[id] = yr.wageIncome[id] ?? 0;
    }
    const row: YamlYear = {
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
    if (yr.modifyInvestmentDetails) {
      row["modify-investment-details"] = true;
      row["investment-breakdown"] = {
        "traditional-retirement":
          yr.investmentBreakdown.traditionalRetirement,
        "roth-retirement": yr.investmentBreakdown.rothRetirement,
        "taxable-investments": yr.investmentBreakdown.taxableInvestments,
      };
    }
    if (yr.eraMetadata) {
      row["era-metadata"] = {
        "era-id": yr.eraMetadata.eraId,
        "overridden-fields": yr.eraMetadata.overriddenFields,
      };
    }
    return row;
  });

  const eras = (s.eras ?? []).map((e) => {
    const facts = e.eraFacts;
    const ef: Record<string, unknown> = {
      "wage-income": facts.wageIncome,
      "other-income": {
        "dividend-income": facts.otherIncome.dividendIncome,
        "interest-income": facts.otherIncome.interestIncome,
        "long-term-capital-gains": facts.otherIncome.longTermCapitalGains,
        "short-term-capital-gains": facts.otherIncome.shortTermCapitalGains,
      },
      expenses: {
        "household-expenses": facts.expenses.householdExpenses,
        taxes: facts.expenses.taxes,
        "other-expenses": facts.expenses.otherExpenses,
      },
    };
    if (facts.modifyInvestmentDetails) {
      ef["modify-investment-details"] = true;
      ef["investment-breakdown"] = {
        "traditional-retirement":
          facts.investmentBreakdown.traditionalRetirement,
        "roth-retirement": facts.investmentBreakdown.rothRetirement,
        "taxable-investments": facts.investmentBreakdown.taxableInvestments,
      };
    }
    return {
      id: e.id,
      nickname: e.nickname,
      description: e.description,
      "start-year": e.startYear,
      "end-year": e.endYear,
      "era-facts": ef,
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
    eras,
    years,
  };
}

function buildScenarioUrl(path: string, scenarioId?: string): string {
  if (!scenarioId) return `${API_BASE}${path}`;
  const params = new URLSearchParams({ scenarioId });
  return `${API_BASE}${path}?${params.toString()}`;
}

export async function loadScenario(scenarioId?: string): Promise<Scenario> {
  const res = await fetch(buildScenarioUrl("/scenario", scenarioId));
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

export async function saveScenario(
  scenario: Scenario,
  scenarioId?: string
): Promise<void> {
  const body = scenarioToYaml(scenario);
  const res = await fetch(buildScenarioUrl("/scenario", scenarioId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to save scenario: ${res.status}`);
}

export async function loadScenarioManifest(): Promise<ScenarioSummary[]> {
  const res = await fetch(`${API_BASE}/scenarios`);
  if (!res.ok) throw new Error(`Failed to load scenarios: ${res.status}`);
  return (await res.json()) as ScenarioSummary[];
}
