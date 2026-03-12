# Overview
In this ticket, we start with the VERY BEGINNINGS of a simple data structure and displaying some of it in the UI. 


## **Simple Data Structure.**
We will be implementing a VERY simple database system as we iterate through the design of this app. We are NOT concerned about the scalability of this app to many users right now, we are just trying to iterate so we can understand what the data modeling needs to be. 

Our simple data will work like this:
TODO: Create **scenario001.yaml**
We will create this file. It will be where all of our data is stored. There will be a 1:1 relationship between a `scenario` and this yaml. 
(Later on, we will create a system for loading up different scenarios, so be mindful of that as you sketch the architecture, but we do not need to build this system out now). 

scenario.yaml will have fields for:

`Assumptions`
- Inflation Rate (number, float)
  - Defaults to: 3%
- Initial portfolio (number, float)
  - Defaults to: $1,000,000
- portfolio growth rate (number, float)
  - Defaults to 6%

`scenario-info`
- scenario-title (string)
- scenario-description (string)
- year-start (number)
  - the default year-start for the app is a number: 2026
- year-end (number)
  - the default year-end is 2076

`household-member`
There can be multiple income earners
EACH `household-member` has: 
    - Nickname (string)
    - birthday (date, Day, Month, Year)

`year`
Years have:
- year-number (number) - year "0" is the 'start-year', and each subsequent year is incremented up one number at a time from that point. 

## UI
**Timeline Tab**
On the `Timeline` tab in the app (`TimelinePage.tsx`) create a a component for `TimelineTable.tsx` using React tables. Columns are:
- `YearNum` and it starts at "0" and increments up. 
- `Year` which shows calendar years. It starts with the `year-start` 
So IF `year-start` is 2026, THEN the first row would show :

| YearNum | Year |
|----|----|
| 0 | 2026 |
| 1 | 2027 | 
| 2 | 2028 |
(etc...)

The table shows ALL of the years between `year-start` and `year-end`. There is no pagination. 

**Assumptions Tab**
WHEN the user makes changes on the Assumptions Page, THEN the scenario001.yaml is updated.

On the `Assumptions` page (`AssumptionsPage.tsx`) we will have a form `AssumptionsForm.tsx`
AssumptionsForm has these elements:

<div>
- H3: that says "Timeline"
- *Year Start* > input field, number, only accepts numbers, sets `year-start`
- *Year End* > input field, number, only accepts numbers, sets `year-end`
</div>

<div>
- H3: that says "Market"
- Inflation: shows the inflation rate (input for inflation rate)
- Portfolio Growth: shows / input for portfolio growth

<div>
- H3: that says "Household"
- Secondary Button that says: "Add Household Member"
- WHEN the user clicks "Add Household Member", THEN a Household_Member_LI component appears ("LI" means "list item")

The `HouseholdMemberLI.tsx` component has the information for each HouseHold Member that the user adds to the file. It contains:
- household-member Nickname (input)
- household-member Birthday (input)
  - MM/DD/YYYY
- "Delete Member" button
</div>

`Update Scenario` / `Revert Changes` Buttons. 
WHEN the user clicks the "Update Scenario" button, THEN any changes made to the fields on `AssumptionsForm` are pushed and updated in scenario001.yaml
IF the user clicks `Revert Changes`, THEN the changes are NOT saved, and they all revert. 


# The Plan

## Phase 0: Dependencies and Data File

**0.1 — Add `js-yaml` dependency**
Install `js-yaml` (and `@types/js-yaml`) for YAML parsing/serialization. There is no YAML library in the project today.

**0.2 — Create `velella/data/scenario001.yaml`**
Create a `data/` folder at the app root (sibling to `src/`). Place `scenario001.yaml` there with default values:

```yaml
scenario-info:
  scenario-title: ""
  scenario-description: ""
  year-start: 2026
  year-end: 2076

assumptions:
  inflation-rate: 0.03
  initial-portfolio: 1000000
  portfolio-growth-rate: 0.06

household-members: []
```

This keeps data separate from source code and is easy to swap for a database later. The `data/` folder can grow to hold multiple scenario files in the future.

**0.3 — Add API middleware to `vite.config.ts`**
Add a small Vite server middleware plugin that exposes two dev endpoints:
- `GET /api/scenario` — reads `data/scenario001.yaml`, parses it, returns JSON.
- `PUT /api/scenario` — accepts JSON body, serializes to YAML, writes to `data/scenario001.yaml`.

This gives us real file persistence during development. The API shape (`GET`/`PUT` on a resource) will translate cleanly to a real backend later.

---

## Phase 1: Types and Data Layer

**1.1 — Create `src/types/scenario.ts`**
Define TypeScript interfaces using camelCase (best practice for TS), with a mapping utility for the kebab-case YAML keys:

- `ScenarioInfo` — `scenarioTitle`, `scenarioDescription`, `yearStart`, `yearEnd`
- `Assumptions` — `inflationRate`, `initialPortfolio`, `portfolioGrowthRate`
- `HouseholdMember` — `nickname`, `birthday` (string, `MM/DD/YYYY`)
- `Scenario` — combines `scenarioInfo`, `assumptions`, `householdMembers[]`

**1.2 — Create `src/services/scenarioService.ts`**
A thin service module with:
- `loadScenario(): Promise<Scenario>` — fetches `GET /api/scenario`, converts keys from kebab-case to camelCase.
- `saveScenario(scenario: Scenario): Promise<void>` — converts keys from camelCase to kebab-case, sends `PUT /api/scenario`.

**1.3 — Create `src/hooks/useScenario.ts`**
A custom React hook that:
- Loads the scenario from the service on mount and exposes it as state.
- Provides a `save` function that calls `saveScenario` and refreshes state.
- Provides the "current saved state" for the Revert/Cancel flow.

---

## Phase 2: Timeline Tab

**2.1 — Create `src/components/Timeline/TimelineTable.tsx`**
A new component using **TanStack Table** and the **counterfoil-kit Table** components (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell`):
- **Props:** `yearStart: number`, `yearEnd: number`
- **Columns:** `YearNum` (0-indexed) and `Year` (calendar year).
- Generates row data from `yearStart` to `yearEnd` (inclusive). No pagination.
- Uses `@tanstack/react-table` for column definitions and row model; renders into counterfoil-kit's `Table` markup.

**2.2 — Update `TimelinePage.tsx`**
Replace "Coming Soon" with `TimelineTable`. Consume scenario data via props from `App.tsx` to get `yearStart` and `yearEnd`.

---

## Phase 3: Assumptions Tab

**3.1 — Create `src/components/Assumptions/HouseholdMemberLI.tsx`**
A list-item component for a single household member:
- **Props:** member data, `onChange`, `onDelete` callbacks.
- **UI:** counterfoil-kit `InputField` for Nickname, `InputField` for Birthday (`MM/DD/YYYY`), `Button` (variant `destructive-secondary`) for "Delete Member".
- Uses `Inline` or `Stack` for layout.

**3.2 — Create `src/components/Assumptions/AssumptionsForm.tsx`**
The form component, managing local (unsaved) form state:
- **Timeline section** — `Text` (size `h3`): "Timeline"; `InputField` (type `number`) for Year Start; `InputField` (type `number`) for Year End.
- **Market section** — `Text` (size `h3`): "Market"; `InputField` (type `number`) for Inflation Rate; `InputField` (type `number`) for Portfolio Growth Rate.
- **Household section** — `Text` (size `h3`): "Household"; `Button` (variant `secondary`): "Add Household Member"; list of `HouseholdMemberLI` components.
- **Action buttons** — `Button` (variant `primary`): "Update Scenario" calls `save`; `Button` (variant `secondary`): "Revert Changes" resets local form state back to the last-loaded scenario data (cancel unsaved edits).

**Props:** Receives the current saved `Scenario` and an `onSave` callback from the parent.

**Form state pattern:** On mount (and when the saved scenario changes), local state is initialized from the saved scenario. Edits only mutate local state. "Update Scenario" pushes local state to the service. "Revert Changes" re-initializes local state from the saved scenario.

**3.3 — Update `AssumptionsPage.tsx`**
Replace "Coming Soon" and the test button. Wire up `useScenario` hook, render `AssumptionsForm`, pass saved data and `save` callback.

---

## Phase 4: Cleanup

**4.1 — Lift `useScenario` to `App.tsx`**
Since both `TimelinePage` and `AssumptionsPage` need scenario data, call `useScenario` in `App.tsx` and pass the relevant data down as props to each page. This avoids duplicate fetches and keeps state in sync across tabs.

**4.2 — Delete `App.css`**
It's unused (leftover from the Vite template).

---

## File Inventory (new and modified)

| File | Action |
|------|--------|
| `velella/package.json` | Modified — add `js-yaml`, `@types/js-yaml` |
| `velella/vite.config.ts` | Modified — add API middleware |
| `velella/data/scenario001.yaml` | **New** — default scenario data |
| `velella/src/types/scenario.ts` | **New** — TypeScript interfaces |
| `velella/src/services/scenarioService.ts` | **New** — load/save functions |
| `velella/src/hooks/useScenario.ts` | **New** — scenario state hook |
| `velella/src/components/Timeline/TimelineTable.tsx` | **New** — TanStack Table component |
| `velella/src/components/Timeline/TimelinePage.tsx` | Modified — use TimelineTable |
| `velella/src/components/Assumptions/HouseholdMemberLI.tsx` | **New** — household member list item |
| `velella/src/components/Assumptions/AssumptionsForm.tsx` | **New** — form with all sections |
| `velella/src/components/Assumptions/AssumptionsPage.tsx` | Modified — use AssumptionsForm |
| `velella/src/App.tsx` | Modified — lift useScenario, pass props |
| `velella/src/App.css` | **Deleted** — unused |

---

## Decisions Log

| Decision | Answer |
|----------|--------|
| YAML file name | `scenario001.yaml` |
| YAML location | `velella/data/` |
| Persistence mechanism | Vite dev middleware (GET/PUT API) |
| Portfolio growth rate default | 6% |
| Table library | TanStack Table + counterfoil-kit Table components |
| UI components | Counterfoil Kit throughout |
| Revert behavior | Reset form state to last-loaded YAML (cancel unsaved edits) |
| Code key convention | camelCase in TS, kebab-case in YAML |
| Terminology | `household-member` (ticket is source of truth) |