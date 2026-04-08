import type { Scenario } from "../types/scenario";

/** Stable-enough equality for dirty detection (full scenario snapshot). */
export function scenariosDeepEqual(a: Scenario, b: Scenario): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}
