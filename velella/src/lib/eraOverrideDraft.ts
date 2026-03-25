import type { YearFactsFieldKey } from "../types/era";
import type { Scenario } from "../types/scenario";
import type { EraOverrideFieldDescriptor } from "./eraOverrideFields";

export type EraOverrideDraft = Partial<
  Record<YearFactsFieldKey, Record<number, number>>
>;

export function formatWholeDollarCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function seedOverrideValuesForYears(
  eraYears: number[],
  value: number
): Record<number, number> {
  return Object.fromEntries(eraYears.map((year) => [year, value]));
}

function compactDraft(
  draft: EraOverrideDraft
): EraOverrideDraft {
  const entries = Object.entries(draft).filter(([, valuesByYear]) => {
    return valuesByYear !== undefined && Object.keys(valuesByYear).length > 0;
  });

  return Object.fromEntries(entries) as EraOverrideDraft;
}

export function buildEraOverrideDraftFromScenario(
  scenario: Scenario,
  eraId: string | undefined,
  eraYears: number[],
  descriptors: EraOverrideFieldDescriptor[]
): EraOverrideDraft {
  if (!eraId || eraYears.length === 0) {
    return {};
  }

  const descriptorMap = new Map(
    descriptors.map((descriptor) => [descriptor.fieldKey, descriptor])
  );

  const nextDraft: EraOverrideDraft = {};

  for (const year of eraYears) {
    const yearInput = scenario.years.find((entry) => entry.year === year);
    if (!yearInput || yearInput.eraMetadata?.eraId !== eraId) {
      continue;
    }

    for (const fieldKey of yearInput.eraMetadata.overriddenFields ?? []) {
      const descriptor = descriptorMap.get(fieldKey as YearFactsFieldKey);
      if (!descriptor) {
        continue;
      }

      const existing = nextDraft[descriptor.fieldKey] ?? {};
      nextDraft[descriptor.fieldKey] = {
        ...existing,
        [year]: descriptor.readYearValue(yearInput),
      };
    }
  }

  return compactDraft(nextDraft);
}

export function reconcileEraOverrideDraftForYears(
  draft: EraOverrideDraft,
  previousEraYears: number[],
  nextEraYears: number[]
): EraOverrideDraft {
  const previousKey = previousEraYears.join(",");
  const nextKey = nextEraYears.join(",");
  if (previousKey === nextKey) {
    return draft;
  }

  const previousYearSet = new Set(previousEraYears);
  const nextYearSet = new Set(nextEraYears);
  const previousStart = previousEraYears[0];
  const previousEnd = previousEraYears[previousEraYears.length - 1];

  const reconciledEntries = Object.entries(draft).map(([fieldKey, valuesByYear]) => {
    if (!valuesByYear) {
      return [fieldKey, valuesByYear] as const;
    }

    const nextValues: Record<number, number> = {};
    for (const year of nextEraYears) {
      if (year in valuesByYear) {
        nextValues[year] = valuesByYear[year]!;
      }
    }

    const existingYears = Object.keys(valuesByYear)
      .map(Number)
      .sort((a, b) => a - b);
    const fallbackStartYear = previousStart ?? existingYears[0];
    const fallbackEndYear = previousEnd ?? existingYears[existingYears.length - 1];
    const startValue =
      fallbackStartYear !== undefined
        ? valuesByYear[fallbackStartYear]
        : undefined;
    const endValue =
      fallbackEndYear !== undefined ? valuesByYear[fallbackEndYear] : undefined;

    for (const year of nextEraYears) {
      if (year in nextValues) {
        continue;
      }
      if (!previousYearSet.has(year) && startValue !== undefined && endValue !== undefined) {
        nextValues[year] =
          fallbackStartYear !== undefined && year < fallbackStartYear
            ? startValue
            : endValue;
      }
    }

    for (const removedYear of previousEraYears) {
      if (!nextYearSet.has(removedYear)) {
        delete nextValues[removedYear];
      }
    }

    return [fieldKey, nextValues] as const;
  });

  return compactDraft(
    Object.fromEntries(reconciledEntries) as EraOverrideDraft
  );
}

export function buildOverrideSummary(
  valuesByYear: Record<number, number> | undefined,
  eraYears: number[]
): string {
  if (!valuesByYear) {
    return "";
  }

  const orderedValues = (
    eraYears.length > 0
      ? eraYears.map((year) => valuesByYear[year]).filter((value) => value !== undefined)
      : Object.values(valuesByYear)
  ) as number[];

  if (orderedValues.length === 0) {
    return "";
  }

  const min = Math.min(...orderedValues);
  const max = Math.max(...orderedValues);
  if (min === max) {
    return formatWholeDollarCurrency(min);
  }

  return `${formatWholeDollarCurrency(min)} - ${formatWholeDollarCurrency(max)}`;
}

export function applyEraOverrideDraftToScenario(
  scenario: Scenario,
  eraId: string,
  draft: EraOverrideDraft,
  descriptors: EraOverrideFieldDescriptor[]
): Scenario {
  const era = (scenario.eras ?? []).find((entry) => entry.id === eraId);
  if (!era) {
    return scenario;
  }

  const nextYears = scenario.years.map((yearInput) => {
    if (yearInput.eraMetadata?.eraId !== eraId) {
      return yearInput;
    }

    let nextYearInput = yearInput;
    const overriddenFields = new Set(
      yearInput.eraMetadata?.overriddenFields ?? []
    );

    for (const descriptor of descriptors) {
      const valuesByYear = draft[descriptor.fieldKey];
      const nextValue = valuesByYear?.[yearInput.year];

      if (nextValue === undefined) {
        overriddenFields.delete(descriptor.fieldKey);
        nextYearInput = descriptor.writeYearValue(
          nextYearInput,
          descriptor.readEraValue(era.eraFacts)
        );
        continue;
      }

      overriddenFields.add(descriptor.fieldKey);
      nextYearInput = descriptor.writeYearValue(nextYearInput, nextValue);
    }

    return {
      ...nextYearInput,
      eraMetadata: {
        ...nextYearInput.eraMetadata,
        eraId,
        overriddenFields: [...overriddenFields],
      },
    };
  });

  return {
    ...scenario,
    years: nextYears,
  };
}
