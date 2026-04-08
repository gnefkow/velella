import type { EraFacts } from "../types/era";
import type { Scenario } from "../types/scenario";
import { applyEraFactsToYearInput } from "./eraFacts";
import type { EraOverrideDraft } from "./eraOverrideDraft";
import { buildDefaultYearInput } from "./yearFacts";

export function overriddenFieldKeysForDraftYear(
  draftOverrides: EraOverrideDraft,
  calendarYear: number
): string[] {
  const keys: string[] = [];
  for (const [fieldKey, byYear] of Object.entries(draftOverrides)) {
    if (byYear && calendarYear in byYear) {
      keys.push(fieldKey);
    }
  }
  return keys;
}

/**
 * Resolved year input for a calendar year using current era draft facts and
 * per-year override draft (era pane preview before save).
 */
export function resolveYearInputWithEraFacts(
  scenario: Scenario,
  calendarYear: number,
  eraFacts: EraFacts,
  draftOverrides: EraOverrideDraft
): import("../types/scenario").YearInput {
  const incomeEarnerIds = scenario.householdMembers
    .filter((m) => m.incomeEarner)
    .map((m) => m.id);
  const existing = scenario.years.find((y) => y.year === calendarYear);
  const base = buildDefaultYearInput(calendarYear, incomeEarnerIds, existing);
  const overridden = overriddenFieldKeysForDraftYear(
    draftOverrides,
    calendarYear
  );
  return applyEraFactsToYearInput(base, eraFacts, overridden);
}
