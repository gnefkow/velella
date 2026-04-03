import type { FilingStatus, Scenario } from "../types/scenario";
import { FILING_STATUS_VALUES } from "../types/scenario";

export const DEFAULT_FILING_STATUS: FilingStatus = "single";

export const FILING_STATUS_SELECT_OPTIONS: {
  value: FilingStatus;
  label: string;
}[] = [
  { value: "single", label: "Single" },
  { value: "married-filing-jointly", label: "Married filing jointly" },
  { value: "married-filing-separately", label: "Married filing separately" },
];

/** Native-select options keyed by filing-status index (era override draft). */
export const FILING_STATUS_INDEX_SELECT_OPTIONS =
  FILING_STATUS_SELECT_OPTIONS.map((opt, index) => ({
    value: String(index),
    label: opt.label,
  }));

/** Shell margin override for tax filing status dropdowns only. */
export const TAX_FILING_STATUS_SELECT_CLASSNAME = "mx-[2px]";

export function normalizeFilingStatus(raw: string | undefined): FilingStatus {
  if (raw && (FILING_STATUS_VALUES as readonly string[]).includes(raw)) {
    return raw as FilingStatus;
  }
  return DEFAULT_FILING_STATUS;
}

export function filingStatusToIndex(status: FilingStatus): number {
  const i = FILING_STATUS_VALUES.indexOf(status);
  return i >= 0 ? i : 0;
}

export function indexToFilingStatus(index: number): FilingStatus {
  return FILING_STATUS_VALUES[index] ?? DEFAULT_FILING_STATUS;
}

export function labelForFilingStatus(status: FilingStatus): string {
  return (
    FILING_STATUS_SELECT_OPTIONS.find((o) => o.value === status)?.label ?? status
  );
}

/** Sets filing status on every year and era template; clears per-year filing overrides. */
export function applyFilingStatusGlobally(
  scenario: Scenario,
  filingStatus: FilingStatus
): Scenario {
  const nextYears = scenario.years.map((y) => ({
    ...y,
    filingStatus,
    eraMetadata: y.eraMetadata
      ? {
          ...y.eraMetadata,
          overriddenFields: (y.eraMetadata.overriddenFields ?? []).filter(
            (k) => k !== "filing-status"
          ),
        }
      : undefined,
  }));

  const nextEras = (scenario.eras ?? []).map((e) => ({
    ...e,
    eraFacts: {
      ...e.eraFacts,
      filingStatus,
    },
  }));

  return {
    ...scenario,
    years: nextYears,
    eras: nextEras,
  };
}
