# **Bringing back "wages" to the table**
----------------------------------------------------------------------
We need to have a second input for Household Member Wages. 
- In addition to giving the user the ability to enter Wages in the YearFactsSidePane, we need the user to have the ability to enter Wages in the table. 
- There should be a "Wages" column for each Household Member. 
- The columns are called "{Household Member Nickname}'s Wages"
- Users can click on this cell and input the wages. 
- The auto-update interaction is the same as what was previously in ticket [006](006_Table-hot-keys.md)
- The "wages" columns go between the "age" columns and the "Income" column


Clarifications:
*Q:* Does this ticket intentionally supersede the direction in `0_resources/PRD/Table-UI.md` that says the table should *not* keep gaining more columns and that detailed year facts should live in the right-side pane? Or is this meant to be temporary?
*A:* Yes. We are making an exception for "Wages" because this is a particularly important field. 


*Q:* Should **every** household member get a dedicated wages column on the table, even if that person is not currently marked as an income earner?
*A:* No. Only household members where income-earner=true

*Q:* If wages can be edited in both the YearFactsSidePane and the table, are those two inputs just two views onto the exact same underlying field, with immediate two-way sync?
*A:* Yes.

*Q:* Should wages behave like other year facts with era inheritance / year-level override behavior, or are table-entered wages always direct year values?
*A:* Don't worry about Eras, that feature has not been implemented yet. 

*Q:* What validation / formatting rules should apply to wages in the table: whole dollars only, decimals allowed, negatives allowed, blank allowed, and what should blank mean?
*A:* Whole dollars only, no decimals. Blank is allowed. Blank means $0. 

*Q:* If a household member's nickname changes, should the column header update automatically everywhere, and do we need any special handling if two members have the same nickname?
*A:* It should change. 


*Q:* When the user edits a wages cell, should that value immediately roll up into the row's `Income` total and any downstream tax calculations in the same calc session?
*A:* It immediatley rolls up. It is the EXACT same thing as the user entering it in the YearFactsSidePane. These are two doors to the same room. 

*Q:* For the keyboard behavior inherited from ticket `006`, should `Return`, `Tab`, click-away, and `ESC` behave exactly the same for wages cells as they do for expenses / other editable table cells?
*A:* Right now, wages are the only editable cels on the page. `Return`, `tab`, `click away` and `esc` should be the same as outlined in `006`, but it will not be possible to tab into "expenses". 

Also, if the user is on the far right (editable) cell in a row, "tab" takes them to the far left tab in the next row. 

----------------------------------------------------------------------

## **Implementation Plan**
### Goal
Add editable wages cells to the `TimelineTable` for each `householdMember` where `income-earner=true`, while keeping the table cell and the `YearFactsPane` field as two views of the same underlying `yearInput.wageIncome[member.id]` value.

### Current architecture to reuse
- `TimelinePage.tsx` already owns the editable local scenario state and recalculates the timeline immediately after a year input changes.
- `YearFactsPane.tsx` already edits wages by calling `onUpdateYearInput(year, updater)`.
- `EditableAmountCell.tsx` already has the desired input behavior for money fields: whole-dollar entry, blank => `0`, and keyboard handling for `Return`, `Tab`, click-away, and `ESC`.
- `TimelineTable.tsx` already builds household-member-driven columns, so wages can be added as another per-member column next to age.

### Implementation steps
1. Extend the table row model so each rendered row carries the source `yearInput`, not just calculated totals.
- Right now `TimelineTable` only builds display rows from calculated `years`.
- We need each row to know both:
  - the calculated `Year` values used for totals like `Income`, `Expenses`, and `C-POP`
  - the persisted/editable `YearInput` for the wages cell
- The cleanest approach is to build rows by matching each calculated `Year` to its corresponding `scenario.years` entry by `year`.

2. Add a table-level year-input updater in `TimelineTable`.
- Mirror the update pattern already used in `YearFactsPane`.
- The table should receive an `onUpdateYearInput(year, updater)` prop from `TimelinePage` instead of trying to mutate scenario data on its own.
- This keeps all editable year facts flowing through the same update path and guarantees immediate recalculation + debounced persistence.

3. Insert one editable wages column for each income earner.
- Keep the current age columns.
- For each `income-earner=true` member, insert a wages column immediately after that member's age column.
- Header text should be `{nickname}'s Wages`.
- The wages columns should appear before the aggregate `Income` column, per the ticket.
- Do **not** create wages columns for non-income-earner household members.

4. Render wages cells with `EditableAmountCell`.
- Cell value should come from `row.yearInput.wageIncome[member.id] ?? 0`.
- `onCommit` should update only that member's wage entry for that year.
- Because `EditableAmountCell` already strips non-digits, the whole-dollar and blank=>0 requirements are already aligned with current behavior.
- Since the table and side pane both read from `localScenario`, edits in one place will immediately appear in the other.

5. Add table-specific keyboard navigation for wages cells.
- Wages are now the only editable cells in the table.
- `Return` should move to the same wages column on the next row.
- `Tab` should move to the next wages column on the same row.
- If the user is in the far-right editable wages cell, `Tab` should wrap to the far-left editable wages cell in the next row.
- `click-away` should commit and stay put.
- `ESC` should discard the uncommitted edit and blur.
- This likely requires `TimelineTable` to own:
  - a stable ordered list of editable column ids (the wages columns only)
  - a `cellRefs` map keyed by row/column
  - a `focusNextCell(direction)` helper similar to the one already used in `YearFactsPane`

6. Preserve row selection behavior while editing.
- Clicking a wages cell should still leave that row as the selected year so the `YearFactsPane` stays in sync with the row being edited.
- Make sure cell focus/edit interactions do not break the existing row `onClick` selection behavior.

7. Verify downstream recalculation behavior.
- After a wages edit, the row's aggregate `Income` value should update immediately.
- Any other timeline-derived outputs that depend on income should also update in the same calc session, because they already derive from `localScenario -> calculateTimeline(...)`.

### Expected file changes
- `velella/src/components/Timeline/TimelinePage.tsx`
  - Pass `handleYearInputUpdate` into `TimelineTable`.
- `velella/src/components/Timeline/TimelineTable.tsx`
  - Build rows that include both calculated year data and source `yearInput`.
  - Add wages columns.
  - Add editable-cell registration and next-cell focus logic.
  - Wire wages commits through `onUpdateYearInput`.
- `velella/src/components/Timeline/EditableAmountCell.tsx`
  - Reuse as-is if possible.
  - Only adjust if the current `Tab` / `Return` navigation API needs a small enhancement for wrapping behavior.

### Test / verification plan
- Select a year and confirm the side pane still shows that year's wages.
- Edit a wages value in the table and confirm the same value appears immediately in `YearFactsPane`.
- Edit a wages value in `YearFactsPane` and confirm the table cell updates immediately.
- Confirm blank input is accepted and resolves to `$0`.
- Confirm only integer-dollar input is possible.
- Confirm `Income` updates immediately after wage edits.
- Confirm `Return` moves down within the same wages column.
- Confirm `Tab` moves right across wages columns.
- Confirm `Tab` from the far-right wages cell wraps to the far-left wages cell in the next row.
- Confirm `ESC` reverts the in-progress edit.
- Confirm non-income-earner household members do not get wages columns.

### Risks / watchouts
- `TimelineTable` currently builds rows from calculated `years` only, so the main structural change is giving each row access to editable source data without duplicating state.
- The keyboard-navigation logic should stay limited to wages columns; the ticket explicitly says users should not tab into `Expenses`.
- Because this table was previously unstable around editable-cell focus behavior, memoization and stable cell keys should be treated carefully while adding the new editable columns.