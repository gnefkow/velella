# **Creating the Year Sidepane.**
------------------------------------------------------------
In this ticket, we're radically upgrading the UI on the Table page. 
Specifically, we're introducing the `YearFactsPane.tsx` component. This component (1) displays and (2) enables users to profide inputs for the `year` object that is stored in the yaml. It moves interactivity from the table rows to a specific pane (enabling us to expand into more inputs in the future.)

**Taxes is a user input** In the future, we may have a more complicated equation behind "taxes". However, for this ticket, "taxes" is a simple user input. 


## **What is in the YearFacts SidePane.** 
------------------------------------------------------------
The `YearFactsSidePane` is a UI component for displaying and enabling people to interact with the `year` object. Each `YearFactsSidePane` shows one year's worth of "facts."

Specifically (for this ticket), the `YearFactsSidePane` displays:
- **Wage Income** *User Input*
  - Open box, number, editable 
  - Default: $0
  - One "Wage Income" input displays for each HouseholdMember with IncomeEarner=true
  - Title: {HouseholdNickname}'s Wages
  - Subtitle: Income from working. 
- **Dividend Income** *User Input*
  - Open box, number, editable 
  - Default: $0
  - Title: Dividend Income
  - Subtitle: Income from dividends. 
- **Interest Income** *User Input*
  - Open box, number, editable 
  - Default: $0
  - Title: Interest Income
  - Subtitle: Income from interest payments on bonds, etc... 
- **Short Term Capital Gains** *User Input*
  - Open box, number, editable 
  - Default: $0
  - Title: Capital Gains (Short Term)
  - Subtitle: Capital Gains income for assets sold that have been held for less than one year. 
- **Ordinary Income** *Calculated*
  - Title: Ordinary Income
  - Subtitle: Income from wages, Dividends, etc...
  - Not editable, displays the `ordinary-income`
- **Long Term Capital Gains** *User Input*
  - Open box, number, editable 
  - Default: $0
  - Title: Capital Gains (Long Term)
  - Subtitle: Capital Gains income for assets sold that have been held for more than one year. 

- **Total Income** *Calculated*
  - This is the sum of Ordinary Income, Long Term Capital Gains, and Short Term Capital Gains. 
  - This is what goes into the Calculate Table Engine. 
  - Not editable in the `YearFactsSidePane`
  - This is `totalIncome` as it is used in the calculateTimeline engine.
- **Household Expenses** *User Input*
  - Open box, number, editable 
  - Title: Household Expenses
  - Subtitle: Normal expenses for the household. 
- **Taxes** *User Input*
  - Open Box, Number, editable
  - Title: Taxes
  - Subtitle: Estimated tax expenses for this year. 
- **Other Expenses** *User Input*
  - Open Box, Number, editable
  - Title: Other Major Expenses
  - Subtitle: Major one-off expenses that might occur in this year (college tuition, house down payment, buying a car, etc...)
- **Expenses** *Calculated*
  - Not editable in the `YearFactsSidePane`
  - This is the sum of Household Expenses, Taxes, and Other Expenses.
  - This is the field that goes into the Calculate Timeline Engine 

Similar to the existing table, entering a value and clicking off of it with Esc, Return, Tab, or clicking off automatically updates that value. (There is no need for a user to click a "save" button).

*Data* Consistent with before: 
- **User input** values that the user inputs will be added to the Yaml. 
- **Calculated Values** are stored in memory. 

## **Where the YearFactsSidePane lives in the code.** 
-----------------------------
The `YearFactsSidePane` lives in the [Timeline directory](/velella/src/components/Timeline/)

## **How the YearFactsSidePane sits on the page.** 
------------------------------------------------------------
The `YearFactsSidePane` 
- is nested in the `TimelinePage.tsx` component. 
- is always open on the screen. 
- Is on the left side of the screen 
- Is 512 px wide. 
- Has background of bg-primary. On the right there is a border that is 1px color: border-secondary. 

This also changes the TimelineTable:
- The TimelineTable has a variable horizontal width: it takes up all of the remaing space on the TimelinePage that isn't being taken up by the YearFactsSidePane.


## **Table as Navigation Item.** 
------------------------------------------------------------
The Table now acts as a navigation item. 
WHEN the user selects a Year (row) on the table, THEN the YearFactsSidePane displays the info for that year. 

When the page opens:
- The previously selected year is selected by default. 
- IF there is no previously selected year, THEN the first year is selected by default. 

Style:
- Normal table rows have a background of bg-primary. 
- When hovering over a row, the table has a background of bg-primary-hover
- When a row is selected, the row has a background of bg-secondary. 

**Table is no longer editable**
Pull out all of the editable columns on the table (incomes and expenses). 

NOW, the table shows

| Year | Portfolio Beg. | {HouseholdMemberNickname} Age |*| Change | Portfolio End | C-POP |

## **Updated calculateTimeline Logic** 
------------------------------------------------------------
The calculateTimeline engine should now layer in this logic:

Note that calculateTimeline takes in `totalIncome` and `expenses`. We now arrive at these values with:

`Ordinary Income` = sum of all `wage-income` s + `dividend-income` + `interest-income` + `short-term-capital-gains`

`totalIncome` = `ordinary-income` + `long-term-capital-gains`

`expenses` = `household-expenses` + `taxes` + `other-expenses`



# **FAQ**
------------------------------------------------------------

### *What about responsiveness?*
We're not concerned about small breakpoints at this time. We'll come back to this later. 


*What is the exact persisted YAML shape for a year now?*
**Let's define this together.**
- Per-household member values:
  - wage income
- Per Year:
  - Dividend Income
  - Interest Income
  - Long Term Capital Gains
  - Short Term Capital Gains
  - Household expenses
  - Taxes
  - Other Expenses


*Are we replacing the old incomes and expenses fields, or mapping them into the new structure for backward compatibility?*
I don't care about old data (we can erase it all if we need to as we make this transition).

"Income" (the thing that corresponds to household member) will need to become "Wage Income" (or `wage-income`)
`totalIncome` can remain the same, in the calculateTimeline equation, but we're now deriving `totalIncome` in a new way. 


*Are Roth conversions in scope for this ticket, or only mentioned as future vocabulary?*
They are not in scope for this. Only mentioned in the subtitle. And, actually, I'll take them out. 


*What exactly counts as ordinary-income in this ticket? The prose and formulas are slightly in tension.*
I updated it. Now it includes short-term capital gains, interest, dividends. 

*Which row is selected by default when the page opens? This matters a lot for the side pane because it is “always open.”*
The first year. 

------------------------------------------------------------

# **Implementation Instructions**
------------------------------------------------------------
This ticket touches three parts of the app at once:
- the persisted `year` data shape
- the Timeline UI layout and interaction model
- the `calculateTimeline` engine inputs

The implementation should proceed in that order so that the UI and engine are both working against the new `year` structure.

## **1. Update the persisted `year` shape**
------------------------------------------------------------
We are replacing the old `year` shape. We do **not** need to preserve old scenario data for this transition.

Right now, a `year` stores:
- `year`
- `expenses`
- `incomes`

For this ticket, a `year` should now persist the user-authored atomic input values in this shape:

```yaml
years:
  - year: 2026
    wage-income:
      household-member-id-1: 150000
      household-member-id-2: 50000
    other-income:
      dividend-income: 0
      interest-income: 0
      long-term-capital-gains: 0
      short-term-capital-gains: 0
    expenses:
      household-expenses: 80000
      taxes: 20000
      other-expenses: 0
```

### **Rules**
- YAML keys remain **kebab-case**
- TypeScript code remains **camelCase**
- Household-member-specific wages are stored under `wage-income`, keyed by HouseholdMember `id`
- The following values are **persisted user input**:
  - `wage-income`
  - `dividend-income`
  - `interest-income`
  - `long-term-capital-gains`
  - `short-term-capital-gains`
  - `household-expenses`
  - `taxes`
  - `other-expenses`
- The following values are **derived only** and should remain in memory:
  - `ordinaryIncome`
  - `totalIncome`
  - total `expenses`
  - `cashChange`
  - `portfolioBeg`
  - `portfolioEnd`
  - `cPop`

## **2. Update the TypeScript scenario types**
------------------------------------------------------------
Update the Scenario typing so that the persisted `YearInput` matches the new YAML shape.

The old model should be replaced by a richer model.

### **Suggested TypeScript shape**
```ts
export interface YearInput {
  year: number;
  wageIncome: Record<string, number>;
  otherIncome: {
    dividendIncome: number;
    interestIncome: number;
    longTermCapitalGains: number;
    shortTermCapitalGains: number;
  };
  expenses: {
    householdExpenses: number;
    taxes: number;
    otherExpenses: number;
  };
}
```

### **Requirements**
- `scenario.ts` should define the new `YearInput` interface
- `ScenarioYaml` should define the matching kebab-case raw YAML shape
- `scenarioService.ts` should convert between:
  - YAML `kebab-case`
  - TypeScript `camelCase`

### **Defaults**
When building a dense years array, new years should default all numeric values to `0`.

That means:
- `wageIncome[id] = 0` for each income earner
- `dividendIncome = 0`
- `interestIncome = 0`
- `longTermCapitalGains = 0`
- `shortTermCapitalGains = 0`
- `householdExpenses = 0`
- `taxes = 0`
- `otherExpenses = 0`

## **3. Rebuild the Scenario service around the new year shape**
------------------------------------------------------------
`scenarioService.ts` should become the boundary that normalizes incoming scenario data into the new year structure.

### **What to change**
- Update `buildDenseYears(...)` so that it creates full `YearInput` objects in the new shape
- Update `yamlToScenario(...)` so that it reads the new nested year values
- Update `scenarioToYaml(...)` so that it writes the new nested year values
- Update `rebuildYearsForRange(...)` so that overlapping years are preserved and new years are created with the new defaults

### **Income-earner behavior**
The existing household-member logic should still apply:
- only members with `incomeEarner=true` get wage inputs
- those wage values are keyed by stable HouseholdMember `id`

If a household member is an income earner, that member should have a `wageIncome[id]` entry for every year.

## **4. Keep the `Year` output model simple**
------------------------------------------------------------
The calculated `Year` object that the timeline displays should remain summary-oriented.

We still want the engine to output the same high-level yearly results:
- `year`
- `yearNum`
- `portfolioBeg`
- `cashChange`
- `portfolioEnd`
- `cPop`

This ticket is **not** the time to put all YearFacts directly onto the calculated `Year` object.

The persisted `YearInput` becomes richer, while the calculated timeline row remains compact.

## **5. Update `calculateTimeline` to derive `ordinaryIncome`, `totalIncome`, and total `expenses`**
------------------------------------------------------------
The `calculateTimeline` engine should now derive its `totalIncome` and `expenses` values from the new `year` structure.

### **Formulas**
For each year:

`ordinaryIncome` =  
sum of all `wageIncome` values  
`+ dividendIncome`  
`+ interestIncome`  
`+ shortTermCapitalGains`

`totalIncome` =  
`ordinaryIncome + longTermCapitalGains`

`expenses` =  
`householdExpenses + taxes + otherExpenses`

`cashChange` =  
`totalIncome - expenses`

`portfolioEnd` =  
`(portfolioBeg * realReturnFactor) + cashChange`

### **Important notes**
- `Taxes` is a plain user input in this ticket
- No tax engine is used yet
- No Roth conversions are in scope
- Missing values should behave as `0`

## **6. Change the table from editor to navigator**
------------------------------------------------------------
The Timeline table is no longer an inline editing surface. It becomes:
- a summary view of each year
- a navigation control for choosing the active year

### **Remove**
Remove the inline editable cells for:
- per-household-member income
- expenses

This means the existing table editing flow should be removed from the Timeline table for this ticket.

### **The table should now show**
- `Year`
- `Portfolio Beg.`
- age columns for household members
- `Change`
- `Portfolio End`
- `C-POP`

The table should **not** show the old editable income or expense columns.

## **7. Introduce selected-year state in `TimelinePage.tsx`**
------------------------------------------------------------
`TimelinePage.tsx` should own the selected year because:
- it owns the local scenario state
- it recalculates the timeline
- it renders both the table and the pane

### **Behavior**
- On first load, select the first year by default
- When the user clicks a table row, that year becomes selected
- The selected year drives the contents of the `YearFactsPane`

### **State**
Add state in `TimelinePage.tsx` for the selected year.

This can be tracked by:
- selected calendar year, or
- selected row index

Prefer tracking by actual `year` value, since that is more stable and easier to reason about.

## **8. Add the `YearFactsPane.tsx` component**
------------------------------------------------------------
Create a new `YearFactsPane.tsx` component in the Timeline directory.

This component should:
- receive the selected year input
- receive the selected calculated year summary if needed
- receive the current `Scenario`
- receive callbacks for updating the selected year

### **What the pane renders**
For the selected year, render inputs for:
- one wage input per income-earning household member
- dividend income
- interest income
- short-term capital gains
- long-term capital gains
- household expenses
- taxes
- other expenses

For the selected year, render calculated display-only values for:
- ordinary income
- total income
- total expenses

### **Interaction**
Editing should work like the existing editable cells:
- user enters a value
- blur / Escape / Enter / Tab commits the value
- there is no explicit save button

The pane should update the selected year's persisted inputs and trigger the same debounced persistence flow already used by `TimelinePage`.

## **9. Use the side pane as the primary editing surface**
------------------------------------------------------------
The pane is now the place where users manipulate yearly planning facts.

That means:
- the table is for scanning and selecting years
- the pane is for editing
- the engine recalculates immediately after edits

This should create a workflow where:
1. user selects a year in the table
2. user edits detailed facts in the pane
3. timeline values update immediately
4. changes persist automatically

## **10. Update the page layout**
------------------------------------------------------------
`TimelinePage.tsx` should render a two-part layout:
- fixed-width `YearFactsPane` on the left
- flexible-width `TimelineTable` on the right

### **Pane layout requirements**
- width: `512px`
- background: `bg-primary`
- right border: `1px` using `border-secondary`
- always visible

### **Table area requirements**
- occupies the remaining horizontal width
- remains horizontally scrollable if needed
- should visually behave like the main content area beside the fixed pane

## **11. Add row-selection styles to the table**
------------------------------------------------------------
The table should clearly communicate that rows are selectable.

### **Required styles**
- normal row background: `bg-primary`
- hover background: `bg-primary-hover`
- selected row background: `bg-secondary`

### **Interaction**
- clicking anywhere on the row selects that year
- the selected styling should follow the active year

## **12. Update the row model used by the table**
------------------------------------------------------------
The existing `TimelineRow` model likely needs to change.

The table no longer needs to carry all of the inline-editing concerns it currently has.

The row object should still include:
- summary timeline values needed for display
- the calendar year
- any age-display data needed for the household-member columns

It may still be helpful for the row object to include a reference to the selected year's persisted input data, but the table should no longer be responsible for editing it directly.

## **13. Reuse existing save flow rather than creating a new one**
------------------------------------------------------------
The app already has a useful local-edit plus delayed-persist pattern in `TimelinePage.tsx`.

This ticket should keep that behavior:
- local scenario updates happen immediately
- `calculateTimeline` reruns immediately
- persistence is debounced

Do **not** introduce a separate save button for the pane.

## **14. Acceptance criteria**
------------------------------------------------------------
This ticket is complete when all of the following are true:

### **Data**
- Scenario years persist using the new nested structure
- New scenario years default all fields to `0`
- Wage inputs are keyed by HouseholdMember `id`
- Derived totals are not written to YAML

### **UI**
- The Timeline page shows a left-side `YearFactsPane`
- The Timeline table is no longer editable
- Clicking a row selects a year
- The first year is selected by default
- The selected row is visually distinct
- The pane always shows the selected year's values

### **Editing**
- Users can edit all user-input YearFacts in the pane
- Blur / Escape / Enter / Tab commits values
- Edits update the timeline immediately
- Edits persist automatically without a save button

### **Engine**
- `calculateTimeline` derives `ordinaryIncome`, `totalIncome`, and total `expenses` from the new `year` shape
- `cashChange` and `portfolioEnd` continue to calculate correctly

## **15. Keep this ticket narrow**
------------------------------------------------------------
This ticket is only about:
- introducing the side pane
- moving yearly editing into the pane
- changing the year data structure to support the pane
- deriving `totalIncome` and `expenses` from richer inputs

This ticket is **not** about:
- tax-estimation automation
- Roth conversions
- account-level distribution logic
- responsiveness for small breakpoints
- named lists of one-off expenses

Those can come in later tickets once this structure is in place.