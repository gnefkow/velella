# **Overview**
--------------------------------------------------
We're going to re-style and re-organize things in the Era Pane on the front end. 

View this design in Figma for the Era Detail Pane: https://www.figma.com/design/U6nhz5NqWRFSnKvHHxOUSG/1-Ok?node-id=87-504&t=VhLpAdNQVklATuhW-1

Note that:
- We are organizing this into:
  - A Content Block with the scrollable area of the pane
  - A Bottom-Bar which has the two action buttons. this locks to the bottom of the pane and is always visible. 
- In the *Content Block*, we have:
  - *Header*
  - *Income Block*
  - *Expense Block*
  - *Investment Block*


In the case of the Income, Expense, and Investment block, we have the "total: for that at the top.

*In the Header*
- *Close Button:* The very top has a button (double-chevron button) that replaces the close (X) button. Clicking this button closes the pane. THe logic does not change, just the visual styling and icon of this button. 
- *Top-bar with Date Selectors and Ellipses button*
  - The Date selectors work the same way, they're just in a new place now with a different styling. 
  - The *Ellipes* button has a drop-down with only one option: Delete Era. The logic of this does not change, it just replaces the existing (trashcan) button. 
- *Nickname* This displays the nickname. Hovering over it changes the background to bg-primary-hover, and clicking on it lets users change the nickname. 
- *Description* Displays the description. Hovering over it changes the background to bg-primary-hover, and clicking on it makes it an editable text area. 

*Inputs*
- The *input fields* for the dollar amounts have this style. (the logic of how they work remains the same.)


*Income:*
- The top of the income is the  total income (the sum of all of the inputs)
- Wages: wages for all wage owners display by default. (same as before, just a new style)
- *"More Income Sources"*: Dividend Income, Interest Income, LTCG and STCG are all hidden by default. 
  - WHEN the "more income sources" do not display, THEN clicking the "+ Add" button opens the accordion with the other options. 
  - WHEN users add values, they can still close the accordion. WHEN the accordion is closed, THEN the "More Income SOurces" shows the sum of all of the "more" categories. 
  - WHEN all of the "more" sources are $0.00, and the user closes the accordion, THEN the closed accordion displays the "+ Add"

*Expenses*
- The top line of the "Expense" block shows the sum of all expenses. 
- The logic of this component does not change, just the style. 

*Invest*
- *Closed Accordion* By default, the "Invest" accordion is closed, and Invest is equal to the "change" (the difference between total income and total expenses).
- *Opened Accordion*
  - WHEN the user clicks the Breakdown Investment button, THEN...
    - The accordion is opened
    - The "Breakdown Investment" checkbox is selected
      - WHEN the uers un-checks the "Breakdown Investment" button, THEN the "Remove Investment Breakdown" modal displays which asks the user if they want to delete the breakdown and return to the simple difference of Income - Expenses. 
    - Investment = Traditional Retirement + Roth Retirement + Taxable Investments
      - These three investment categories are added to the YAML
    - Available to invest = income - expenses
    - "Difference" is the difference between the `Available to Invest` and the investments that the user has allocated to the three investment categories. 


*Clarifications*

**Open questions for product (answer before implementation plan)**

1. **“More income sources” when collapsed with non-zero totals** — Figma shows a summary row (“More income sources:” + chevron + amount + help). Should **clicking that row** (not only “+ Add”) open the accordion, or is “+ Add” the only entry point until the user has entered values?
*ANSWER:* Clicking on that chevron also opens it. 

2. **“More income sources” copy and punctuation** — Should the closed states use the exact strings from Figma (“More income sources.” vs “More income sources:”) or one consistent label in the app?
*ANSWER:* Use what is in Figma

3. **Invest header total in breakdown mode** — When breakdown is on, should the bold **Invest** line show the **sum of the three buckets**, **income − expenses (available)**, **allocated total**, or something else? (Figma shows one pattern; the ticket says *Investment = Traditional + Roth + Taxable*.)
*ANSWER:* "Invest" should show the sum of the three investment categories. NOT income-expenses.
The "Available to invest" row will show income - expenses. 

4. **Closing the Invest section without unchecking** — If breakdown is on, can the user **collapse** the block (accordion) while keeping breakdown enabled, or is the only “off” path **uncheck → modal → confirm**?
*ANSWER:* The user cannot close the Invest section without unchecking. Unchecking is the ONLY way to close that accordion. 

5. **“Breakdown Investment” control** — In the open state, is the checkbox **the** toggle (uncheck = modal), or should the **pill button** remain as a separate control? Any requirement for **keyboard** (Space/Enter) on the checkbox vs button?
*ANSWER:* It is THE ui to close it. 
--> Button to OPEN
--> Un-check (plus confirmation modal) to close. 

6. **Remove Investment Breakdown modal** — Confirm **exact title, body, and button labels** (e.g. Cancel / Remove breakdown), and whether confirming **zeros the three YAML fields** or only stops using them in the engine until next edit.
*ANSWER:* If the investment breakdown is canceled either by un-checking in the block (lplus confirmation modal) or by cancelling the pane (with the cancel button), THEN the YAML is updated at that point. We do not want to over-hang things until the "next edit"

7. **Help (?) icons** — Figma includes help on totals and inputs. Should we **ship tooltips** in this ticket (with approved copy), **icons with no tooltip**, or **defer** help to a later ticket?
*ANSWER:* Put tooltips on everything. If we don't have text for it yet, just put "explanation needed" as the text. 

8. **`bg-primary-hover`** — Should this map to an **existing Counterfoil / app token** (which one?), or is it a **new** semantic we add in Velella only for nickname + description?
*ANSWER:* Everything should map to the existing counterfoil tokens. 

9.  **Ellipsis menu** — Any spec for **focus trap**, **Escape to close**, and **click-outside** beyond matching current delete behavior?
*ANSWER:* This behaviour should stay the same as what we currently have. 

10. **Scroll and safe area** — Should the **Content Block** scroll under a **fixed** bottom bar on all breakpoints we support, and is the pane height still **100% of the narrative column** as today?
*ANSWER:* Yes, the content block should scroll under the bottom bar, and the height should still be 100%

11. **Design philosophy note for the ticket** — Per team process, should we add bullets for what is **consistent** and **inconsistent** with [design philosophy](/0_resources/design_philosophy.md) once the above are decided?
Yes. 


*Implementation Plan*

### 1. Scope and implementation intent
- Re-style the existing `EraDetailPane` to match the Figma structure and visuals while preserving the existing save / delete / close behavior.
- Re-organize the pane into two layout regions:
  - `ContentBlock`: scrollable, contains `Header`, `IncomeBlock`, `ExpensesBlock`, and `InvestmentBlock`
  - `BottomBar`: fixed to the bottom, always visible, contains `Cancel` and `Update`
- Keep logic changes tightly scoped to the behaviors explicitly required by this ticket:
  - Header visual rework
  - Income accordion for "More income sources"
  - Investment breakdown accordion + confirmation flow
  - Tooltip coverage on totals and inputs
  - YAML support for the three investment categories

### 2. Current-state grounding in the codebase
- `EraDetailPane.tsx` already owns the pane draft state, save flow, keyboard shortcut, and delete modal wiring. It should remain the container for draft lifecycle and persistence.
- `EraFactsForm.tsx` currently renders a flat stack of `YearFactsField`s plus `InvestFactsSection`. This is the right place to split the content into the three Figma blocks without pushing persistence logic into many leaf components.
- `InvestFactsSection.tsx` already contains most of the investment math display concepts from Ticket 024 (`availableToInvest`, `effectiveInvest`, `investmentDifference`, toggle behavior). This ticket should evolve that component rather than re-implementing the investment logic inside the era pane.
- `eraFacts.ts`, `types/era.ts`, `types/scenario.ts`, and the scenario / era services already hold the era YAML shape. This is where the new investment-category fields should be added and merged.

### 3. Component decomposition
- Keep `EraDetailPane.tsx` as the stateful shell. Its responsibilities should be:
  - build and own the draft
  - compute `hasChanges` / `canSave`
  - call `createEra`, `updateEra`, `deleteEra`
  - open / close modals
  - pass focused props down to presentational sections
- Extract or retain small components so the pane follows the design philosophy:
  - `EraPaneHeader`
    - double-chevron close button
    - year range selectors
    - ellipsis menu with Delete Era
    - nickname / description editable surfaces
  - `EraIncomeSection`
    - wages rows
    - collapsed / expanded “More income sources” states
    - total row
  - `EraExpensesSection`
    - expenses total
    - three expense rows
  - `EraInvestSection`
    - collapsed “Breakdown Investment” button
    - expanded checkbox mode
    - three investment account rows
    - available to invest + difference rows
  - `EraPaneBottomBar`
    - Cancel
    - Update
- Reuse shared row / input primitives where that reduces duplication, but avoid a single over-generalized mega-component with too many mode flags.

### 4. Layout and styling plan
- Match the Figma pane structure:
  - overall pane stays full-height within the narrative column
  - `ContentBlock` becomes `overflow-y-auto`
  - `BottomBar` becomes `shrink-0` and visually separated with the Figma shadow / top border treatment
- Map all visual styling to existing Counterfoil semantic tokens and utilities, not raw one-off colors.
- Match the Figma typography hierarchy for:
  - nickname
  - description
  - block titles and totals
  - small button labels
- Use existing Counterfoil button primitives where possible, but where the Figma shape / affordance is pane-specific, compose local wrappers around those primitives rather than forcing the entire pane into generic button markup.
- Add hover styling to nickname and description using existing semantic hover tokens only.

### 5. Header implementation
- Replace the current top bar (`X` / trash) with the Figma header structure:
  - top mini row with the double-chevron close button
  - second row with start year selector, divider, end year selector, and ellipsis menu
  - third row with nickname and description content
- Preserve existing year-selection logic by continuing to use `getYearDropdownOptions`; only the rendering and placement change.
- Replace the direct trash icon button with an ellipsis-triggered menu that contains only `Delete Era`.
- Match current delete behavior for interaction details:
  - same delete modal
  - same escape / click-outside behavior as current menu system
- Keep nickname and description inline-editable:
  - default display mode matches Figma
  - hover shows `bg-primary-hover`
  - click enters the current editable mode
- If inline-edit behavior becomes awkward inside the current `EraNarrativeFields`, fold that logic into a dedicated header component rather than keeping narrative editing separate from the Figma header.

### 6. Income block implementation
- Render wages for all income earners by default, exactly as today, but restyled into the new block layout.
- Compute the block total as:
  - sum of all wage inputs
  - plus all "more income sources" inputs
- Introduce explicit UI state for the “More income sources” accordion in the era pane draft view:
  - collapsed zero state: shows `More income sources.` and `+ Add`
  - collapsed non-zero state: shows `More income sources:` with chevron, total, and tooltip
  - expanded state: shows the four additional income rows inside the styled accordion container
- Implement the ticket’s clarified behavior:
  - `+ Add` opens the accordion
  - the chevron / summary row also opens it
  - once values exist, users can collapse it
  - if all four values are zero when collapsed, it returns to the `+ Add` state
- Keep these four fields mapped to the existing era facts keys:
  - `dividendIncome`
  - `interestIncome`
  - `shortTermCapitalGains`
  - `longTermCapitalGains`

### 7. Expenses block implementation
- Restyle the existing three expense inputs into the Figma block structure.
- Keep all logic unchanged:
  - same three fields
  - same persistence flow
  - same descriptions / tooltips
- Compute the total as the sum of:
  - `householdExpenses`
  - `taxes`
  - `otherExpenses`

### 8. Investment block implementation
- Extend the investment data model from a single invest scalar into three persisted investment categories on era facts and year input:
  - `traditionalRetirement`
  - `rothRetirement`
  - `taxableInvestments`
- Preserve the Ticket 024 concept that the user-facing investment math should still derive:
  - `availableToInvest = totalIncome - totalExpenses`
  - `allocatedInvest = traditionalRetirement + rothRetirement + taxableInvestments`
  - `difference = availableToInvest - allocatedInvest`
- Use the clarified behavior from this ticket:
  - collapsed by default when breakdown is off
  - collapsed header total equals the simple invest amount (income minus expenses)
  - clicking `Breakdown Investment` opens the block and enables the breakdown mode
  - expanded header total shows the sum of the three investment categories
  - the checkbox is the only UI to turn breakdown back off
  - unchecking opens the confirmation modal before clearing the breakdown
- When breakdown is enabled:
  - render `Available to Invest`
  - render inputs for the three investment categories
  - render `Difference`
- When breakdown is disabled:
  - do not show the detailed rows
  - treat effective invest as `income - expenses`
- Add a dedicated modal for removing the investment breakdown instead of overloading the existing unsaved-changes modal.

### 9. Data model and YAML changes
- Update `types/era.ts` and `types/scenario.ts` so era facts and year inputs can persist the three investment-category values plus the existing breakdown toggle state.
- Update YAML serialization / deserialization in the relevant services so these fields persist in kebab-case.
- Update defaults in `buildDefaultEraFacts` and any corresponding year-input builder so new scenarios initialize these fields to zero.
- Update era-application logic in `applyEraFactsToYearInput` so the new investment-category fields cascade correctly from eras to years.
- Update the year override field-key list so year-level overrides can independently override:
  - breakdown toggle if needed
  - traditional retirement
  - Roth retirement
  - taxable investments
- If the current single `invest` scalar remains needed for backward compatibility in the engine, treat it as derived / transitional and keep the derivation in one helper module, not scattered across UI code.

### 10. Calculation and helper changes
- Centralize investment totals in a helper module so the UI and engine use one source of truth.
- Add or extend helpers to compute:
  - total income
  - total expenses
  - available to invest
  - total allocated investments
  - investment difference
- Update the timeline calculation path so the engine uses the correct effective invest amount:
  - if breakdown is off, invest follows `availableToInvest`
  - if breakdown is on, invest follows the sum of the three categories
- Keep calculation logic out of JSX. Components should receive already-computed totals where possible.

### 11. Tooltip strategy
- Put tooltip triggers on:
  - income total
  - expense total
  - invest total
  - available to invest
  - difference
  - each editable amount field that shows a help icon in Figma
- Use the existing app tooltip / info-bubble pattern rather than inventing a new tooltip system for this ticket.
- Where approved explanatory copy does not yet exist, use `explanation needed` per product direction.
- Keep tooltip text close to the field definitions so copy is easy to replace later.

### 12. Modal and unsaved-state behavior
- Keep the existing pane save / close behavior intact.
- Keep the current delete-era modal intact; only the trigger changes from trash icon to ellipsis menu item.
- Add a separate “remove investment breakdown” confirmation modal for the checkbox-off flow.
- Implement the clarified persistence rule:
  - if the user removes the investment breakdown, the YAML-backed draft should be updated immediately in the pane draft state
  - if the user cancels the pane, draft changes are discarded as usual
  - there should be no hidden “hang onto old breakdown values until later” behavior

### 13. Testing plan
- Add helper tests for investment totals and difference calculations.
- Add tests around era facts defaults / merging so the new investment fields cascade correctly.
- Add UI tests or component-level tests for:
  - income accordion zero vs non-zero collapsed states
  - breakdown button opening the invest block
  - checkbox-off confirmation flow
  - block totals reflecting the underlying values
- Update scenario fixtures under `data/` so all YAML examples remain valid after the schema change.

### 14. Delivery sequence
1. Add / update helper logic and types for the new investment categories.
2. Update services and YAML parsing / serialization.
3. Refactor the pane layout shell into `ContentBlock` + `BottomBar`.
4. Implement the new header.
5. Restyle expenses block.
6. Restyle and wire the income accordion.
7. Implement the investment breakdown block and confirmation modal.
8. Add tooltips.
9. Run through lints and regression checks for save / delete / keyboard behavior.

### 15. Design philosophy check
- **Consistent with the design philosophy**
  - Break the pane into small, boring components instead of growing `EraDetailPane.tsx`.
  - Keep investment math in helpers / services, not embedded in rendering.
  - Reuse existing Counterfoil tokens and primitives instead of raw colors and ad hoc styling.
  - Prefer explicit props and narrow component responsibilities for each block.
- **Potentially inconsistent with the design philosophy unless we are careful**
  - A single highly-conditional `EraFactsForm` could become a god file if all Figma states stay inline.
  - Re-implementing tooltip, row, or investment math separately for Era and Year panes would duplicate business logic.
  - Mixing YAML migration logic into UI components would couple state and rendering too tightly.
- **Guardrail for implementation**
  - If any one pane file grows past roughly 150-200 lines of meaningful logic, extract the next obvious section immediately.


### **Bug 1: Action bar stuck to the top**
- EXPECTED BEHAVIOUR: the action "bottom bar" should lock to the bottom of the pane. 
- NOW: The bar is stuck to the top of the pane

### **Bug 2: Modals not displaying**
WHEN the user has made a change and tries to close the pane without saving, OR the user makes a change and tries to close the pane with cancel OR when the user opens the breakdown investment accordion and then tries to close it with the checkbox...
THEN: modals should display to confirm these actions

What is happening: these modals are not displaying. 
Step 1: Confirm that the LOGIC is hhappening by having a toast that displays that says "modal fired" if the modal is displayin gon the screen

**Hypotheses (why neither toast nor modal appears)**

1. **Unsaved / Cancel flows only exist on Timeline, not Narrative.** `EraUnsavedChangesModal` is wired in `TimelinePage` when switching panes with unsaved era edits. On **Narrative**, `EraDetailPane` `Cancel` / close may call `onClose` directly with **no** modal—so neither modal nor toast would ever fire for those actions on that tab.
*STATUS: Addressed — `NarrativePage` now uses `eraPaneRef`, `EraUnsavedChangesModal`, and `requestClosePane` / `requestSelectEra` / `requestCreateEra` (same pattern as Timeline) so unsaved changes block close and list navigation.*
*OUTCOME: Failed, the modals are still not visible*

2. **Modal `isOpen` never becomes `true`.** If the guard conditions in `requestPaneTransition` (era unsaved) or the investment checkbox handler never set the relevant state, React never renders the modal and the toast `useEffect` never runs with `isOpen === true`.
*STATUS: Addressed — For **new** eras, `hasChanges` previously ignored `eraFacts`, so editing only income/expense/invest facts left `hasUnsavedChanges()` false and never opened the modal. Now new-era dirty state includes `eraFacts` vs `buildDefaultEraFacts`. `hasUnsavedChanges` reads a ref updated in `useEffect` so the imperative handle matches the latest flag.*
*OUTCOME: success, the modals are now visible*

### **Bug 3: input boxes are adding strange characters**
The input boxes have strange behaviour. 
- This is true of:
  - ALL input fields in EraDetailPane
- Not happening in:
  - Fields of YearFactsPane

What is happening: adding to the input adds two zeros to the end numbber. 
For example, if the current number is: $27,000
AND the user clicks on the far left and adds (single key-stroke) a "1"
THEN: The result is $12,700,000.00

What should happen:
- We do NOT need decimals in these inputs
- The result to the example above should be 127,000

**Hypothesis**

`EraPaneAmountInput` (`velella/src/components/General/EraPaneAmountInput.tsx`) is a **controlled** field with `value={formatCurrency(parseMoneyValue(rawValue))}`. `formatCurrency` uses `Intl.NumberFormat` with **`minimumFractionDigits: 2` / `maximumFractionDigits: 2`**, so the string shown is always like **`$27,000.00`**.

On every keystroke, `onChange` does `event.target.value.replace(/\D/g, "")` and treats that as the **whole-dollar digit string**. The literal **`00` from `.00` is not punctuation—it is two extra digits**. So `$27,000.00` becomes **`"27000000"`** (not `"27000"`), i.e. the numeric value is inflated by **100×** before the user even edits. When the user inserts **`1`** at the left, the browser’s intermediate string is along the lines of **`$127,000.00`**, whose digits are **`"12700000"`** → **$12,700,000.00**, matching the bug.

`YearFactsPane` (via `EditableAmountCell`) avoids this: it formats money with **`maximumFractionDigits: 0`** (no `.00` in the display), and uses **focus-aware** display so editing works from a digit-derived formatted string, not from a cents-suffixed template.

**Proposed fix**

1. **Remove fractional cents from era amount display** — use the same convention as `EditableAmountCell.formatMoneyDisplay`: `maximumFractionDigits: 0` (and no forced `minimumFractionDigits: 2`).
2. **Optional hardening** — mirror `EditableAmountCell` more closely: while focused, derive display from the **raw digit buffer** + integer-only currency format (and e.g. move caret to end if needed), so `onChange` never re-parses a string that could include fake “fraction” digits.
3. **Optional reuse** — replace `EraPaneAmountInput`’s inner input logic with `EditableAmountCell` (or extract shared `useMoneyDigitInput` / format helpers) so Timeline and Era pane stay one implementation.


### **Bug 4: All (?) buttons should be tertiary buttons** 
THey should all be 
- Hierarchy = quaternary
- size = small

*STATUS: Partial — Only the optional / “(?)” inline actions use `variant="tertiary"` and `size="sm"`: **+ Add** (more income) and **Breakdown Investment** in `EraFactsForm`. All other era-pane and modal buttons use their prior variants (e.g. footer Cancel/Update quaternary+primary `lg`, modals secondary/primary or tertiary/destructive-secondary).*


### **Bug 5: Block Styling**
- The Income, Expenses, Invest, and Header blocks should all have: 24px padding on left and right
- The expense, Income, and Invest blocks should have 24px padding on top and bottom
- The Income and Expense blocks should have a 1px border on the bottom that is color: border-secondary

*STATUS: Superseded by layout below — horizontal padding is once on the scroll column (`px-6` in `EraDetailPane`); sections are full width inside that inset.*

### **Bug 6: Pane width, inset, and key/value alignment**
- Era detail pane is **512px** wide.
- **24px** horizontal padding inside the pane (single column inset for header + all blocks).
- Content blocks **fill** the width within that inset (`min-w-0` / `w-full` on sections and rows).
- Key/value rows (section totals and fact rows): **key left-aligned**, **value right-aligned** (including amount inputs and help controls on the value side).

*STATUS: Done — `EraDetailPane` `aside` uses `w-[512px]`; scroll inner wrapper `px-6`; `EraPaneHeader` / `EraFactsForm` sections no longer add their own horizontal padding; `EraPaneSectionHeader`, `EraPaneFactRow`, readonly and “more income” summary use `flex-1` + `text-left` on keys and `justify-end` + `text-right` on values.*



The following should be H5's:
- "Income" (and it's value pair), Expenses (and its value pair), and Invest (and its value pair.)
  - They should be H5 heavy, color: text-primary

*STATUS: Done — `EraPaneSectionHeader` uses Counterfoil `Text` with `size="h5"`, `hierarchy="primary"`, `weight="heavy"` for the section title (renders as `<h5>`) and the currency total (same typography via `as="span"`).*


### **Bug 6: Quarternary Buttons failing to inheret style**
Next, the "quarternary" buttons from counterfoil are not inhereting their styles correclty. I can see that they are visually incorrect. 

**Investigation — top 3 hypotheses (primary / secondary look correct):**

1. **Ghost-button / surface contrast (token design, not a missing import).** Counterfoil’s `quaternary` variant is mostly **transparent** with muted `--button-quaternary-text` and light hover washes (`semanticTokens.css`). **Primary** and **secondary** paint their own fills, so they read “correct” on many backgrounds; **quaternary** is defined *against* whatever sits behind it. On dark chrome, pane surfaces, or temporary debug tints (e.g. inline blue/yellow blocks in `EraPaneHeader` / `EraDetailPane` footer), the same token values can look wrong or low-contrast even though CSS is applied.
*ANSWER:* This is NOT it, on the browser, they are apearing as gray and with an outline. They SHOULD display as ghost buttons, but they're not. 

2. **Semantic “inheritance” mismatch vs pane typography.** The pane uses Counterfoil **text** tokens (`text-text-secondary`, etc.) for surrounding UI. **Quaternary** buttons do not use those — they use **button** tokens (`--button-quaternary-*`). Visually, people may expect ghost actions to **match** adjacent label/icon color (inherit the pane hierarchy), but the kit intentionally uses a separate scale. Primary/secondary don’t create that expectation because they read as filled **actions**, not chrome.
*Answer* This is NOT it. It isn't about user expectation. The expectation is that they look like quarternary buttons (with transparent background, no outline, grey on hover...), but that is not what they lok like. 

3. **Tailwind v4 + kit preset drift (verify in DevTools).** Velella is on **Tailwind 4** while the kit’s `tailwind.config.cjs` is written for the classic v3 `theme.extend` pattern. If the merged config or v4’s handling of a specific utility diverges, you could get a partial stylesheet (unlikely for one variant only, but quick to rule out): inspect a quaternary `<button>` and confirm `bg-[var(--button-quaternary-bg)]`, `text-[var(--button-quaternary-text)]`, and `focus-visible:ring-button-quaternary` are all present and computed — and that variables resolve on `:root`.

**ROOT CAUSE (confirmed):** The inline “?” affordances are **`EraPaneHelpButton`**, a plain `<button>` with only layout/typography utilities — **not** Counterfoil `Button` (`variant="quaternary"`). Without explicit `border-0`, `bg-transparent`, `appearance-none` (and related resets), **user-agent default button styling** (filled background + border) shows through. Footer Cancel/Update use the real kit `Button`, which is why those variants looked fine while the help triggers did not.

*STATUS: Fix applied — `EraPaneHelpButton` resets native chrome and uses a focus ring for keyboard users.*


### **Update styles for all input boxes**
Let's over-ride the style for ALL input boxes in our system
Make this change at the CSS Override level (where we do our manual style overrides of the counterfoil tokens) (not at the component level), because we want it to apply to ALL textarea and input boxes. 
- Padding: .125 em padding on all sides (top, bottom, left, right)
- Background Color & Border:
  - Default: bg-secondary
  - Selected / Focus: background: bg-primary, border: fg-primary
  - Hover: background: bg-secondary, border: border-secondary
  - Corner radius (all states): .06 em


### **Style Overrides for Nickname and Description**
In the EraDetailPane for Nickname (Era name) and description, we'll have different styles:
- Default:
  - Border: none
  - background color: bg-primary
- Hover: 
  - Border: border-secondary
  - Background: bg-primary-hover
- Focus/editing
  - Background: bg-primary
  - border: fg-primary


