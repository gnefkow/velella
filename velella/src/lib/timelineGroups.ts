import type { Era } from "../types/era";
import { getEraForYear, sortErasByStartYear } from "./eraHelpers";

export interface TimelineEraGroup {
  type: "era";
  era: Era;
  years: number[];
}

export interface TimelineNonEraGroup {
  type: "non-era";
  years: number[];
}

export type TimelineGroup = TimelineEraGroup | TimelineNonEraGroup;

/**
 * Builds an ordered list of timeline groups from the rendered years and scenario eras.
 * Each group is either an era group (years in an era) or a non-era group (consecutive years not in any era).
 * If there are no eras, returns one large non-era group covering all years.
 */
export function buildTimelineGroups(
  years: number[],
  eras: Era[] = []
): TimelineGroup[] {
  if (years.length === 0) return [];

  const sortedEras = sortErasByStartYear(eras);

  if (sortedEras.length === 0) {
    return [{ type: "non-era", years: [...years] }];
  }

  const groups: TimelineGroup[] = [];
  let currentYears: number[] = [];
  let currentEra: Era | undefined;

  for (const year of years) {
    const era = getEraForYear(sortedEras, year);

    if (era?.id === currentEra?.id) {
      currentYears.push(year);
      continue;
    }

    if (currentYears.length > 0) {
      if (currentEra) {
        groups.push({ type: "era", era: currentEra, years: [...currentYears] });
      } else {
        groups.push({ type: "non-era", years: [...currentYears] });
      }
    }

    currentYears = [year];
    currentEra = era;
  }

  if (currentYears.length > 0) {
    if (currentEra) {
      groups.push({ type: "era", era: currentEra, years: [...currentYears] });
    } else {
      groups.push({ type: "non-era", years: [...currentYears] });
    }
  }

  return groups;
}

/** Returns the group that contains the given year, or undefined. */
export function getGroupForYear(
  groups: TimelineGroup[],
  year: number
): TimelineGroup | undefined {
  return groups.find((g) => g.years.includes(year));
}

/** Returns whether the year is the first in its group. */
export function isFirstYearInGroup(
  groups: TimelineGroup[],
  year: number
): boolean {
  const group = getGroupForYear(groups, year);
  return group ? group.years[0] === year : false;
}

/** Returns whether the year is the last in its group. */
export function isLastYearInGroup(
  groups: TimelineGroup[],
  year: number
): boolean {
  const group = getGroupForYear(groups, year);
  return group ? group.years[group.years.length - 1] === year : false;
}
