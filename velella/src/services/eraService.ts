import type { Era } from "../types/era";
import type { Scenario, YearInput } from "../types/scenario";
import { generateEraId } from "../lib/id";
import { buildDefaultEraFacts } from "../lib/eraFacts";
import { yearsInRange, doesRangeOverlapOtherEra } from "../lib/eraHelpers";
import { applyEraFactsToYearInput } from "../lib/eraFacts";

/** Creates a new era (does not persist; returns updated scenario). */
export function createEra(
  scenario: Scenario,
  draft: { nickname: string; description: string; startYear: number; endYear: number; eraFacts: Era["eraFacts"] }
): Scenario {
  const incomeEarnerIds = scenario.householdMembers
    .filter((m) => m.incomeEarner)
    .map((m) => m.id);

  const overlaps = doesRangeOverlapOtherEra(
    scenario.eras ?? [],
    draft.startYear,
    draft.endYear
  );
  if (overlaps) {
    throw new Error("Era range overlaps another era");
  }

  const era: Era = {
    id: generateEraId(),
    nickname: draft.nickname,
    description: draft.description,
    startYear: draft.startYear,
    endYear: draft.endYear,
    eraFacts: draft.eraFacts,
  };

  const years = yearsInRange(draft.startYear, draft.endYear);
  const yearsByYear = new Map(scenario.years.map((y) => [y.year, y]));

  const updatedYears = scenario.years.map((yearInput) => {
    if (!years.includes(yearInput.year)) return yearInput;

    return {
      ...applyEraFactsToYearInput(yearInput, era.eraFacts, []),
      eraMetadata: {
        eraId: era.id,
        overriddenFields: [],
      },
    };
  });

  const existingYears = new Set(updatedYears.map((y) => y.year));
  for (const year of years) {
    if (!existingYears.has(year)) {
      const defaultInput: YearInput = {
        year,
        wageIncome: Object.fromEntries(
          incomeEarnerIds.map((id) => [id, era.eraFacts.wageIncome[id] ?? 0])
        ),
        otherIncome: { ...era.eraFacts.otherIncome },
        expenses: { ...era.eraFacts.expenses },
        eraMetadata: { eraId: era.id, overriddenFields: [] },
      };
      updatedYears.push(defaultInput);
      updatedYears.sort((a, b) => a.year - b.year);
    }
  }

  return {
    ...scenario,
    eras: [...(scenario.eras ?? []), era],
    years: updatedYears,
  };
}

/** Updates an era and cascades to years on save. */
export function updateEra(
  scenario: Scenario,
  eraId: string,
  draft: { nickname: string; description: string; startYear: number; endYear: number; eraFacts: Era["eraFacts"] }
): Scenario {
  const eraIndex = (scenario.eras ?? []).findIndex((e) => e.id === eraId);
  if (eraIndex < 0) return scenario;

  const overlaps = doesRangeOverlapOtherEra(
    scenario.eras ?? [],
    draft.startYear,
    draft.endYear,
    eraId
  );
  if (overlaps) {
    throw new Error("Era range overlaps another era");
  }

  const eras = scenario.eras ?? [];
  const updatedEra: Era = {
    ...eras[eraIndex],
    nickname: draft.nickname,
    description: draft.description,
    startYear: draft.startYear,
    endYear: draft.endYear,
    eraFacts: draft.eraFacts,
  };

  const oldEra = eras[eraIndex];
  const oldYears = yearsInRange(oldEra.startYear, oldEra.endYear);
  const newYears = yearsInRange(draft.startYear, draft.endYear);

  const removedYears = oldYears.filter((y) => !newYears.includes(y));
  const addedYears = newYears.filter((y) => !oldYears.includes(y));

  const updatedYears = scenario.years.map((yearInput) => {
    if (yearInput.eraMetadata?.eraId !== eraId) {
      if (removedYears.includes(yearInput.year)) {
        const { eraMetadata, ...rest } = yearInput;
        return rest;
      }
      return yearInput;
    }

    if (removedYears.includes(yearInput.year)) {
      const { eraMetadata, ...rest } = yearInput;
      return rest;
    }

    const overriddenFields = yearInput.eraMetadata?.overriddenFields ?? [];
    return {
      ...applyEraFactsToYearInput(yearInput, draft.eraFacts, overriddenFields),
      eraMetadata: { eraId, overriddenFields },
    };
  });

  const existingYears = new Set(updatedYears.map((y) => y.year));
  const incomeEarnerIds = scenario.householdMembers
    .filter((m) => m.incomeEarner)
    .map((m) => m.id);

  for (const year of addedYears) {
    if (!existingYears.has(year)) {
      const defaultInput: YearInput = {
        year,
        wageIncome: Object.fromEntries(
          incomeEarnerIds.map((id) => [id, draft.eraFacts.wageIncome[id] ?? 0])
        ),
        otherIncome: { ...draft.eraFacts.otherIncome },
        expenses: { ...draft.eraFacts.expenses },
        eraMetadata: { eraId, overriddenFields: [] },
      };
      updatedYears.push(defaultInput);
      updatedYears.sort((a, b) => a.year - b.year);
    }
  }

  const newEras = [...eras];
  newEras[eraIndex] = updatedEra;

  return {
    ...scenario,
    eras: newEras,
    years: updatedYears,
  };
}

/** Deletes an era; years keep their values but are unlinked. */
export function deleteEra(scenario: Scenario, eraId: string): Scenario {
  const updatedYears = scenario.years.map((yearInput) => {
    if (yearInput.eraMetadata?.eraId !== eraId) return yearInput;
    const { eraMetadata, ...rest } = yearInput;
    return rest;
  });

  return {
    ...scenario,
    eras: (scenario.eras ?? []).filter((e) => e.id !== eraId),
    years: updatedYears,
  };
}

/** Creates a field-level override for a year in an era. */
export function createYearFieldOverride(
  scenario: Scenario,
  year: number,
  fieldKey: string
): Scenario {
  const yearInput = scenario.years.find((y) => y.year === year);
  if (!yearInput?.eraMetadata) return scenario;

  const overriddenFields = [...(yearInput.eraMetadata.overriddenFields ?? [])];
  if (overriddenFields.includes(fieldKey)) return scenario;

  overriddenFields.push(fieldKey);

  return {
    ...scenario,
    years: scenario.years.map((y) =>
      y.year === year
        ? { ...y, eraMetadata: { ...y.eraMetadata!, overriddenFields } }
        : y
    ),
  };
}

/** Relinks a field to the era (removes override). */
export function relinkYearFieldToEra(
  scenario: Scenario,
  year: number,
  fieldKey: string
): Scenario {
  const yearInput = scenario.years.find((y) => y.year === year);
  if (!yearInput?.eraMetadata) return scenario;

  const era = (scenario.eras ?? []).find((e) => e.id === yearInput.eraMetadata!.eraId);
  if (!era) return scenario;

  const overriddenFields = (yearInput.eraMetadata.overriddenFields ?? []).filter(
    (k) => k !== fieldKey
  );

  const updatedYearInput = applyEraFactsToYearInput(
    yearInput,
    era.eraFacts,
    overriddenFields
  );

  return {
    ...scenario,
    years: scenario.years.map((y) =>
      y.year === year
        ? { ...updatedYearInput, eraMetadata: { eraId: yearInput.eraMetadata!.eraId, overriddenFields } }
        : y
    ),
  };
}
