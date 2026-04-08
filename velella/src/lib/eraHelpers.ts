import type { TertiaryNativeSelectOption } from "../components/ui/TertiaryNativeSelect";
import type { Era } from "../types/era";
import type { YearFactsFieldKey } from "../types/era";
import type { YearInput } from "../types/scenario";

/** Returns years in the range [startYear, endYear] inclusive. */
export function yearsInRange(startYear: number, endYear: number): number[] {
  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }
  return years;
}

/** Sorts eras by startYear ascending. */
export function sortErasByStartYear(eras: Era[]): Era[] {
  return [...eras].sort((a, b) => a.startYear - b.startYear);
}

/** Returns true if the proposed range overlaps any other era (excluding the given eraId). */
export function doesRangeOverlapOtherEra(
  eras: Era[],
  proposedStart: number,
  proposedEnd: number,
  excludeEraId?: string
): boolean {
  for (const era of eras) {
    if (era.id === excludeEraId) continue;
    const overlaps =
      (proposedStart >= era.startYear && proposedStart <= era.endYear) ||
      (proposedEnd >= era.startYear && proposedEnd <= era.endYear) ||
      (proposedStart <= era.startYear && proposedEnd >= era.endYear);
    if (overlaps) return true;
  }
  return false;
}

/** Returns the era that occupies the given year, or undefined. */
export function getEraForYear(eras: Era[], year: number): Era | undefined {
  return eras.find((e) => year >= e.startYear && year <= e.endYear);
}

/** First calendar year in [yearStart, yearEnd] not covered by any era, or null if the range is full. */
export function findFirstEmptyYearForEras(
  yearStart: number,
  yearEnd: number,
  eras: Era[]
): number | null {
  for (let y = yearStart; y <= yearEnd; y++) {
    if (!getEraForYear(eras, y)) {
      return y;
    }
  }
  return null;
}

export interface YearDropdownOption {
  year: number;
  disabled: boolean;
  disabledReason?: string;
}

/** Computes dropdown options for start/end year selectors. */
export function getYearDropdownOptions(
  yearStart: number,
  yearEnd: number,
  eras: Era[],
  currentEraId: string | undefined,
  selectedStartYear: number | null,
  selectedEndYear: number | null,
  isStartDropdown: boolean
): YearDropdownOption[] {
  const options: YearDropdownOption[] = [];
  for (let y = yearStart; y <= yearEnd; y++) {
    const occupyingEra = getEraForYear(eras, y);
    const isOccupiedByOther =
      occupyingEra && occupyingEra.id !== currentEraId;

    let disabled = false;
    let disabledReason: string | undefined;

    if (isOccupiedByOther && occupyingEra) {
      disabled = true;
      disabledReason = `Part of ${occupyingEra.nickname || "another era"}`;
    } else if (isStartDropdown && selectedEndYear !== null && y > selectedEndYear) {
      disabled = true;
      disabledReason = "After end year";
    } else if (!isStartDropdown && selectedStartYear !== null && y < selectedStartYear) {
      disabled = true;
      disabledReason = "Before start year";
    }

    options.push({ year: y, disabled, disabledReason });
  }
  return options;
}

/** Maps year dropdown options to `TertiaryNativeSelect` options (Era pane header, Narrative list). */
export function yearDropdownOptionsToTertiarySelectOptions(
  options: YearDropdownOption[]
): TertiaryNativeSelectOption[] {
  return options.map((option) => ({
    value: String(option.year),
    label: String(option.year),
    disabled: option.disabled,
    title: option.disabledReason,
  }));
}

/** Returns true if the year has era metadata linking it to an era. */
export function isYearInEra(yearInput: YearInput): boolean {
  return Boolean(yearInput.eraMetadata?.eraId);
}

/** Returns true if the field is overridden for this year. */
export function isFieldOverridden(
  yearInput: YearInput,
  fieldKey: YearFactsFieldKey
): boolean {
  return yearInput.eraMetadata?.overriddenFields?.includes(fieldKey) ?? false;
}
