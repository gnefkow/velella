# **Overview**
--------------------------------------------------
RIGHT NOW: the "change" is the amount that we are assuming people invest each year. 
We no longer want to make that assumption. Instead, we want to move to a model where users can input the amount that they will invest each year.


Here is specifically what we are going to do:
- The "Change" column remains, but it is calculated by an input from the user. 
  - The input is called "invest" an is part of the YearFactsPane and also part of the EraDetailsPane. 
  - (When users put it into the EraDetailsPane, it cascades through to all of the years in that "era" just like all other fields). 
  - The "Invest" field is the last (bottom) field in the pane.
- There is a new non-editable field in the EraDetailsPane and the YearFactsPane called "Available to Invest"
  - Available To Invest = All Income - All Expenses
  - It displays in the panes at the bottom as the second-to-last field. 

By default, "Invest" is not-editable in the field, and is simply equal to the "Available to Invest" amount. 
There is a toggle underneath the field that says "modify investment details". If the user toggles that on, then the field becomes editable, and the user's input will be the new "invest" amount. 
- IF the user toggles this field back off, THEN their input is deleted and the field becomes the "Available to Invest" number again. 



*Clarification Questions*
*QUESTION:*
1. **Portfolio math:** Today `calculateTimeline` adds `cashChange` (income − expenses) to the portfolio each year. After this ticket, should the portfolio contribution each year be the user’s **invest** amount instead? If **invest** can differ from **Available to Invest**, where does the gap go in the model (e.g. ignored for portfolio projection, treated as spent elsewhere, or should invest be constrained to equal available)?
*ANSWER:* It is ok for there to be a gap. 
In the Panes, display the gap below the "Invest" input. So the order will be:
- Available to invest (calculated, not editable)
- Invest: (editable by the user)
- Difference: (calculated, not editable. Can be a negative number. If it is negative, make it red)


2. **Timeline “Change” column:** Should the table’s **Change** column display **invest** (the user input), **Available to Invest** (income − expenses), or both (e.g. two columns)? If it shows only invest, do we still need income/expenses visible on the row for context, or is the pane enough?
*ANSWER:* Both "available to invest" and "invest" amounts.

3. **Data model & migration:** Confirm the YAML field name (e.g. `invest` on year input / era facts). For existing scenario YAMLs, should we default **invest** from the current implied value (income − expenses for that year), zero, or leave it unset until the user fills it?
*Answer:* Yes, name it "invest" in the Yaml. Default to the income-expenses amount.


4. **Validation & UX:** May **invest** exceed **Available to Invest**, or go negative? If over/under is allowed, should the UI warn (soft) or block (hard)? Should **Available to Invest** show a negative number when expenses exceed income, or clamp/display differently?
*Answer:* Yes, it can go negative. We'll render it as negative in the "difference" field. 


5. **Scope:** Should **invest** and **Available to Invest** appear anywhere besides YearFactsPane, Era detail, and the timeline table (e.g. exports, narrative copy, PRD vocabulary)?
*ANSWER:* For now, just render it in the YearFactsPane, Era Detail Pane, and the table. 


Also Note: In the future, users will have the option to specify what types of investment accounts they'll put things into. (Traditional/401k accounts, Roth accounts, taxable accounts). When we implement that, we will sum these for the total portfolio, so "Invest" will equal the sum of those account types.
THat is a future ticket/implementation. 
*Notes:*
What is worth doing so the future ticket is cheaper:
Treat invest as “total invested this year” in the model and engine, not as “the only representation forever.” That stays valid when it becomes a sum.
Resolve “invest for this year” in one place (e.g. a small helper used by calculateTimeline and the UI) so later you can swap “read scalar” for “sum of account flows” without touching every caller.
Avoid hard-coding “this is always a single text field in the pane” deep in business logic — keep logic on the numeric total; the pane can later add sub-fields that all feed that total.


*Implementation Plan*

### 1. Domain helpers (single source of truth)
- Add a small module (e.g. `lib/invest.ts`) that, given resolved year inputs (post–era merge), computes:
  - **`availableToInvest`** = `totalIncome − totalExpenses` (reuse `calculateYearFacts` totals).
  - **`effectiveInvest`**: if `modifyInvestmentDetails` is false → `availableToInvest`; if true → stored **`invest`** (allow negative per ticket).
  - **`investmentDifference`** = `availableToInvest − effectiveInvest` (negative when invest exceeds available; use for red styling in panes).
- Use **`effectiveInvest`** only inside `calculateTimeline` for `portfolioEnd` (replace today’s `cashChange` in that sum). Keep the “gap” out of portfolio math beyond the invest line.

### 2. Types & YAML
- Extend **`EraFacts`** and **`YearInput`** with:
  - **`modifyInvestmentDetails`**: boolean, default `false`.
  - **`invest`**: number, only read when `modifyInvestmentDetails` is true; when toggling off, clear from persisted data.
- Extend **`YearFactsFieldKey`** (and any switch that lists relink/override keys) with keys for these two fields so era cascade matches other facts.
- Update **`ScenarioYaml`** / **`scenarioService`** (load + save) for kebab-case keys under years and under `era-facts` (e.g. `modify-investment-details`, `invest`).
- **Naming (per design philosophy):** **camelCase** in TS types and code; **kebab-case** in YAML only; new **PascalCase** component if a shared invest block is extracted (e.g. `InvestFactsSection.tsx`).
- Update **`buildDefaultYearInput`**, **`buildDefaultEraFacts`**, and **`applyEraFactsToYearInput`** to merge `invest` and `modifyInvestmentDetails` like existing era fields.
- **Migration:** no need to stamp every year with `invest` if default is “follow available”: existing scenarios behave like today once `modifyInvestmentDetails` defaults to `false`. Optionally strip or ignore any stale `invest` when the flag is false on load.

### 3. Calculated timeline row (`Year` / table data)
- Extend the calculated **`Year`** type (and `calculateTimeline`) with explicit fields the UI needs, e.g. **`availableToInvest`** and **`invest`** (effective), instead of overloading **`cashChange`**.
- **`TimelineTable`**: add a column for **available to invest**; keep or rename the **Change** column so it shows **effective invest** (label clearly—e.g. “Invest”—per product copy). Ensure row model passes through resolved year input or the computed numbers for both.
- **Philosophy:** Table cells stay **dumb** (format + display); any derived numbers come from the engine / row model, not recomputed in the cell. If column definitions or formatters grow heavy, extract a small formatter module or column builder helper—don’t inflate `TimelineTable.tsx` into a logic hub.

### 4. UI — `YearFactsPane`
- Near the bottom of the pane (order per ticket):
  1. **Available to invest** — read-only, shows `availableToInvest`.
  2. **Invest** — read-only display of `effectiveInvest` when toggle off; editable amount when toggle on (same numeric styling as other amount fields).
  3. **Difference** — read-only, `investmentDifference`; **red** when negative (semantic token / utility class, not raw hex).
- Toggle **“Modify investment details”** under the Invest row: on → enable edit and persist `modifyInvestmentDetails: true` + `invest`; off → clear custom invest, set flag false, snap display to available.
- Wire updates through existing **`onUpdateYearInput`** / era override patterns; register override keys when the year diverges from era for these fields.
- **Philosophy:** Keep non-trivial branching (toggle, effective vs stored value) in a **hook or helper**; the pane mostly composes children with explicit props. If this block exceeds ~150–200 lines in the pane file, extract a narrow component (e.g. **`InvestFactsSection`**) plus layout that uses existing rhythm primitives—don’t grow a god-pane.

### 5. UI — `EraDetailPane` / era facts form
- Same field order and toggle behavior as the year pane, scoped to **era facts** and propagating to all years in the era until a year overrides (same as other cascaded fields).
- **Philosophy:** **Compose** the same invest UI (shared presentational component or shared hook + thin wrappers) instead of duplicating toggle/readonly logic between Year and Era—favor composition over two parallel condition-heavy implementations.

### 6. Era service & edge cases
- **`eraService`**: ensure relink/override flows include the new keys; bulk apply era facts to years picks up defaults for invest behavior.
- Turning **modify** off at era level: define whether that clears per-year overrides for `invest` or only era template (match product expectation; simplest is era flag + clear era `invest` when off, leave year overrides unless user relinks).

### 7. Tests & fixtures
- Add unit tests for **`effectiveInvest`**, difference sign, and timeline portfolio step using custom vs default invest.
- Update **all scenario YAMLs under `data/`** so they remain valid and representative (optional `invest` / `modify-investment-details` only where useful).

### 8. Design philosophy (explicit checklist)
- **Modular / small files:** Target **`lib/invest.ts`** (or similar) for all invest math; optional **`InvestFactsSection.tsx`** (or hook + tiny views) if panes would exceed ~150–200 lines; avoid a second copy of the same logic in Era vs Year.
- **Components:** One narrow job per piece; **explicit props**; shared invest UI **composed** into `YearFactsPane` and era form—not one mega-component with a `mode: "year" | "era"` unless that stays trivial.
- **Styling:** **Semantic classes / tokens** only for negative difference and spacing; if “negative row” rules multiply, extract a one-line helper or shared class name—no raw hex or one-off inline typography in panes.
- **State / logic:** **Business rules** (effective invest, difference, toggle-off clearing) live in **helpers, hooks, or services**—not buried in JSX except trivial wiring.
- **Clarity:** Prefer **explicit** field names on `Year` (`availableToInvest`, effective `invest`) over reusing `cashChange` with a new meaning; refactor early if Year/Era/table each re-derive the same numbers differently.
- **Layout:** Use existing **layout primitives** for spacing between the three readouts and the toggle so rhythm stays consistent with the rest of the pane.


