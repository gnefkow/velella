# **Overview of Scenarios**
-------------------------------------------------------

## What Is a Scenario?

A **Scenario** is the central planning object in Velella. It is both a UX concept and a persisted file in the system. Users create and edit scenarios to answer a core life question: *If I pursue my dreams according to this plan, will we be ok financially?*

Scenarios help individuals and couples model different life paths—e.g., CoastFIRE, career changes, sabbaticals, retirement—and see how their portfolio and expenses evolve over time.

---

## Scenario Structure (Code)

A `Scenario` (`src/types/scenario.ts`) contains:

| Section | Purpose |
|--------|---------|
| **scenarioInfo** | Title, description, and year range (`yearStart`, `yearEnd`) |
| **assumptions** | Global inputs: inflation rate, initial portfolio, market return, safe withdrawal rate |
| **householdMembers** | People in the household (nickname, birthday, income-earner flag) |
| **years** | Per-year inputs: wage income, other income, expenses; optional era metadata |
| **eras** | Optional groupings of years with shared era facts and narrative |

---

## Persistence and Storage

- **Format:** YAML (kebab-case keys) stored via the backend API
- **Service:** `scenarioService.ts` — `loadScenario()` fetches from `/api/scenario`; `saveScenario()` PUTs the scenario
- **Conversion:** `yamlToScenario()` and `scenarioToYaml()` handle camelCase ↔ kebab-case mapping
- **Hook:** `useScenario()` loads on mount and exposes `scenario`, `save`, `persist`, `refresh`

---

## Data Model Principles

- **Persist** user-authored facts (dates, income, expenses, era definitions)
- **Derive** calculated results (portfolio balances, C-POP) — these are recomputed from the scenario
- **Years** are the canonical planning unit; eras push facts down into years and support field-level overrides

---

## How Scenarios Flow Through the App

1. **Load** — `useScenario` fetches the scenario from the API on app load
2. **Consume** — `TimelinePage`, `NarrativePage`, and `AssumptionsPage` receive the scenario and maintain local state for edits
3. **Calculate** — `calculateTimeline(scenario)` in `src/engine/calculateTimeline.ts` produces `Year[]` with portfolio amounts and C-POP
4. **Persist** — Edits trigger `onPersist` or `onSave`; the scenario is written back via the API

---

## Key Relationships

- **Years** — One `YearInput` per calendar year in the range; holds income, expenses, and optional `eraMetadata` for overrides
- **Eras** — Group contiguous years; define `eraFacts` that cascade to member years; years can override individual fields
- **Household members** — Wage income is keyed by member ID; only income earners contribute to wage columns

---

## Scale Expectations

- At most ~2 scenarios loaded at once
- Typically ≤100 years per scenario (often ~50)
- Optimized for flexibility and clarity, not large-scale performance