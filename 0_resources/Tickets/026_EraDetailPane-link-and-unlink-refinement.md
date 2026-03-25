# **Overview**
--------------------------------------------------
This ticket refines elements of the [EraDetalePane](/velella/src/components/General/EraDetailPane.tsx). Specifically, it:
-  Re-arranges and re-styles some elements of the input fields (and the labels for them)
-  Brings back the link/unlink buttons that control year-specific overrides. 
-  Make sure that the overrides are working (QA testing)
  
#### *Background context*
- Review the way that "Overrides" work in our system. Overrides are elements of the code that enable users to "override" the elements of a specific `year` in an `era`
- HOW IT SHOULD WORK: 
  - WHEN a user puts a `year` into an `era`, THEN the values for that `era` are applied to the `year`
  - WHEN a `year` is already a part of the `era`, THEN there is a link button that the user can click to override the specific year within the `era`
  - WHEN a user already has an override on a `year`, THEN the user clicks the button to (re-)"link" the value to the `era`
    - THEN the override is deleted and the value is re-set to be whatever is in the `era` for that value. 
- *NEW*: If the user has un-linked a value in the `era`, THEN 
  - They can see a non-editable summary of the overrides in the EraDetailsPane &&
  - They can see a button to edit the values &&
  - When the push the `Edit Values` button, THEN the `Overrides Modal` displays, which lets them edit the values. 




# **Implementation**
--------------------------------------------------
We're going to progress through this in steps. 


## **Step 1: Set buttons.**
First, let's just move (and resurect) buttons:
- (1) Move the (?) buttons away from the "values" and to follow the labels. 
- (2) Add the link buttons to the values (following the values)
  - FOR NOW: the link buttons pop the `Overrides Modal`.
    - The `Overrides Modal` just has text that says "coming soon" and an X to close. 
    - (opening and closing the modal changes nothing.)

*Implementation Plan:*

- **Current layout (baseline)**  
  - Per-row help lives on the **value** side: `EraPaneAmountInput` renders `EraPaneHelpButton` after the input (`EraPaneAmountInput.tsx`), and `EraPaneFactRow` / `EraPaneReadonlyRow` also place help next to currency when the right side is not an amount input (`EraFactsForm.tsx`).

- **(1) Move `(?)` to follow labels**  
  - Update `EraPaneFactRow` so the left column is an inline group: **label text** + `EraPaneHelpButton` (same `description` / `aria-label` pattern as today: `Show explanation for ${label}`).  
  - Remove `EraPaneHelpButton` from `EraPaneAmountInput` (drop the `description` prop from that component if it becomes unused).  
  - Update `EraPaneReadonlyRow` and the **numeric** branch of `EraPaneFactRow` so help is no longer beside the dollar amount; use the same label-adjacent help pattern.  
  - **“More income sources”** summary row: align with the mock by placing help after the primary label text (the chevron row), not beside the trailing total—unless product prefers keeping section-total help; default to label-adjacent for consistency with other rows.  
  - Leave **`EraPaneSectionHeader`** as-is (help already sits with the section title/total header, which matches the mock’s Income / Expenses / Invest headers).

- **(2) Link control after values + stub Overrides modal**  
  - Add a small **link affordance** immediately **after** the amount field (same horizontal group as the input—Step 1 copy says “following the values”; the Figma-style mock shows it inside or flush to the input—pick one visual and use existing tokens / `EraPaneHelpButton`-sized hit target for consistency). Use `lucide-react` (e.g. `Link2`) for the icon.  
  - Extend `EraPaneAmountInput` with an optional `onLinkClick?: () => void` (or always render the button; no-op until wired). Click opens the modal.  
  - Add **`EraOverridesModal.tsx`** (or equivalent name) in `velella/src/components/General/`, following the same portal pattern as `EraDeleteModal.tsx`: `createPortal`, `MODAL_PORTAL_BACKDROP_STYLE`, `role="dialog"`, `aria-modal`, focus-friendly close. Body copy: **“Coming soon”**; primary dismiss: **X** (and backdrop click optional—match other era modals).  
  - Hold `isOpen` state in **`EraFactsForm`** (single modal instance; opening/closing does not mutate scenario data). Pass `onLinkClick` from `EraFactsForm` into every `EraPaneAmountInput` used for era facts rows so all link buttons open the same stub.  
  - **Out of scope for Step 1:** override detection, link vs unlink visuals, and real override editing.

- **Design philosophy ([design philosophy](/0_resources/design_philosophy.md))**  
  - **Consistent with:** composable rows, explicit props on `EraPaneAmountInput`, reusing existing modal/help patterns and tokens (no ad-hoc colors).  
  - **Watch / mild tension:** `EraFactsForm.tsx` is already large; Step 1 only adds minimal state + one small modal file—avoid further growth in that file in later steps by extracting row/modal wiring if needed.


--------------------------------------------------

## **Step 2: Override Modal: V1**

- Override Modal:
  - Header Block:
    - Title: {Label}
      - This should be whatever the label is for what was selected. Example: if the user clicked the link button on "Jack's Wages", THEN the title for the Overrides Modal would be "Jack's Wages"
      - IF: The user clicked on "Household Expenses" row in the Era Detail Pane, THEN the title for the Override Modal would be "Household Expenses"
      - Style: H5, heavy, color=text-primary
    - Subtitle: 
      - String: {era name} Era, {year-start for the era} - {year end for the era}
      - Style: size: body-2, color: text-tertiary
  - Toggle Block:
    - The toggle turns the override on and off.
    - The change isn't actually made until the modal is closed with the "save" button
    - Title:
      - String: "Override {label}"
        - Examples: "Override Jack's Wages", "Override Household Expenses"
      - Style: body-1 heavy, color: text-primary
    - Subtitle:
      - String: "Enter specific {Jack’s Wages} values for years in this era."
      - Style: body-2, color: text-secondary
  - Action Bar:
    - Save: saves the changes and closes the modal. 
    - Cancel: cancels the changes and closes the modal. 

*Implementation Plan:*

- **Figma reference ([Overrides Modal node](https://www.figma.com/design/3FgubNxI3yc3FjgFS2S1CC/Untitled?node-id=30-1347)) — layout & spacing**  
  - **Card shell:** `bg-bg-primary`, rounded corners, `shadow-md`-equivalent (match existing modal card shadow on `EraDeleteModal` / `EraInvestmentBreakdownModal` — `shadow-lg` + border `border-border-secondary`). Horizontal padding **36px** (`px-9` if using Tailwind 4px grid: 9×4=36); top padding **16px** (`pt-4`); keep **X** close control (Step 1) top-right inside the card — treat **X** like **Cancel** (discard modal-local state, no save).  
  - **Header block** (`HeaderBlock`, node `30:1348`): vertical padding **16px** (`py-4`); **4px** gap (`gap-1`) between title and subtitle; full width, items start-aligned.  
  - **Toggle block** (`OverrideToggleBlock`, node `30:1351`): vertical padding **16px** (`py-4`); horizontal **gap 36px** (`gap-9`) between text stack and switch; **top + bottom borders** using `border-border-tertiary` (Figma: `border-tertiary`) — use `border-t border-b border-border-tertiary` so the block reads as a band between header and footer.  
  - **Action bar** (`ActionBar`, node `30:1356`): vertical padding **16px** (`py-4`); **top border** `border-t border-border-secondary` (Figma: `border-secondary`); `flex justify-between items-center` — **Cancel** left, **Save** right. Figma shows a fixed content width (~413px); in app use `w-full max-w-md` (or match existing modal `max-w-md`) so the bar spans the card content area.

- **Typography & colors (semantic tokens — align to ticket; note Figma deltas)**  
  - **Modal title (`{label}`):** H5, heavy → Counterfoil **`Text`** `size="h5"` `weight="heavy"` `hierarchy="primary"` **or** utility classes **`text-h5`** + **`text-text-primary`** (match `EraPaneSectionHeader` title styling intent).  
  - **Header subtitle** (`{era name} Era, {start} - {end}`): body-2, **`text-text-tertiary`** (matches Figma token on node `30:1350`).  
  - **Toggle title** (`Override {label}`): body-1 heavy, **`text-text-primary`**.  
  - **Toggle subtitle** (`Enter specific {label} values for years in this era.`): body-2, **`text-text-secondary`** per ticket; Figma node `30:1354` uses **`text-tertiary`** — if visual QA prefers parity with Figma, switch to **`text-text-tertiary`**.  
  - Do **not** paste raw hex from Figma exports; use the semantic classes above.

- **Components (Counterfoil + app patterns)**  
  - **Save:** **`Button`** `variant="primary"` `size="lg"` (Figma `button-lg` height ~40px, pill radius — match kit defaults).  
  - **Cancel:** **`Button`** `variant="tertiary"` `size="lg"`; Figma includes a **refresh / rotate-ccw** icon before the label — use **`lucide-react`** `RotateCcw` (or equivalent) with `gap` consistent with kit icon+label buttons. If the kit button does not support a leading icon slot cleanly, use `inline-flex` + icon + label inside the button children while preserving variant styles.  
  - **Toggle:** No existing app-wide switch was found in a quick pass — implement a **small accessible switch**: `button` or `role="switch"` + `aria-checked`, keyboard support, **off** track `bg-bg-tertiary` (Figma `bg-tertiary`), **on** track **`bg-accent-primary`** or kit brand solid equivalent (Figma `bg-brand-solid` / teal); thumb `bg-white` + small shadow per Figma. Keep sizing ~44×24px to match design.  
  - **Close (X):** Reuse Step 1 control pattern (focus ring, `aria-label`).

- **State & data flow**  
  - **Open context:** When the user opens the modal from a row’s link control, pass **`fieldLabel: string`** (the same string shown in the pane, e.g. `"Jack's Wages"`, `"Household Expenses"`).  
  - **Era subtitle:** **`EraFactsForm`** does not currently receive era metadata — add props from **`EraDetailPane`** (draft is authoritative while editing): e.g. **`eraNickname`**, **`eraStartYear`**, **`eraEndYear`** (nullable numbers). Format: `{nickname} Era, {start} - {end}`; if years missing, show a safe fallback (e.g. em dash or “Set years in header”) so the modal never shows `null`.  
  - **Modal-local state:** On open, initialize **`overrideEnabledDraft`** from… **Step 2 only:** if persistent override state does not exist yet, default **`false`** (or `true` if you introduce a placeholder map keyed by field id). **Toggling** only updates **`overrideEnabledDraft`** until **Save**.  
  - **Save:** Commit `overrideEnabledDraft` into whatever structure Step 3+ will use (for Step 2, a **`useState`** map or stub in **`EraFactsForm`** / parent is enough so Save “does something” observable in dev — e.g. `console` or in-memory ref); then close modal.  
  - **Cancel / X:** Close without writing committed state; discard draft.  
  - **Accessibility:** `aria-labelledby` pointing at title; toggle labeled by “Override {label}” via `aria-labelledby` / `aria-describedby` to the subtitle string.

- **Files to touch (expected)**  
  - **`EraOverridesModal.tsx`** — replace stub body with three blocks + wiring props (`fieldLabel`, `eraSubtitle` string or parts, `initialOverrideEnabled`, `onSave`, `onCancel`/`onClose`).  
  - **`EraFactsForm.tsx`** — hold selected field label, modal draft state, pass era meta from new props; pass `onLinkClick` that sets label + opens modal.  
  - **`EraDetailPane.tsx`** — pass nickname + year range into **`EraFactsForm`**.  
  - **`EraPaneAmountInput.tsx`** — optionally change **`onLinkClick`** to **`onLinkClick?: () => void`** unchanged, or pass label up via callback **`onLinkClick?: (label: string) => void`** — prefer **parent knows label** from row render props (cleaner than threading label through input).

- **Design philosophy ([design philosophy](/0_resources/design_philosophy.md))**  
  - **Consistent with:** token-driven text/background/border classes, Counterfoil buttons, portal + backdrop pattern from other era modals, explicit props for modal context.  
  - **Watch:** **`EraFactsForm`** grows with modal + future override map — consider extracting **`EraOverridesModal`** content into subcomponents or a thin hook (`useOverridesModalState`) if the file crosses the preferred size guideline.

--------------------------------------------------

## **Step 3: Override Modal: V2**
View the figma here: https://www.figma.com/design/U6nhz5NqWRFSnKvHHxOUSG/1-Ok?node-id=110-1742&t=VhLpAdNQVklATuhW-1
Specifically, this concerns: https://www.figma.com/design/U6nhz5NqWRFSnKvHHxOUSG/1-Ok?node-id=110-1282&t=VhLpAdNQVklATuhW-1

Now we're going to add year-specific list items to the EraOverridesModal.
- WHEN the user has toggled Override {thing}=ON
  - THEN we display the YearOverrideList with the YearOverrideListItems

*The YearOverrideList and YearOverrideListItems:*
- Has one list item for each year that is in the era
- Each list item is for one year and has a label that is the `year` and an input.
  - The Label is {year}, {Input}
  - THe input box is the same as everywhere else.
    - The input is stored in the front-end until the user hits the "Save" button
- WHEN the user has Overrides OFF and then turns Overrides ON
  - THEN the inputs for all of the boxes in the modal reflect what the user had had for the era
    - Example: Jack had $100,000 for "Jack's Wages" for the era named "On the hill" which spanned 2028 - 2030.
      - WHEN jack opens the OverrideModal & Toggles overrides to ON
      - THEN: the YearOverrideList displays in the modal, and the YearOverrideListItems are:
        - 2028 Wages: $100,000
        - 2029 Wages: $100,000
        - 2030 Wages: $100,000
        - (each of the wage amounts are editable. The user can have different values for each year.)
- IF: the user hits "Save", THEN the modal closes and the specific year updates are saved. 
    - IF: they were toggled on, THEN it uses the specific years with Overrides on
    - IF: they were toggled off, THEN the override is deleted and the era uses the Era Facts
  - IF the user hits "Cancel", THEN the modal closes and no changes are made.

*The list item/row in the EraDetailPane for an overriden field*
When a field has overrides, the row looks like this: https://www.figma.com/design/U6nhz5NqWRFSnKvHHxOUSG/1-Ok?node-id=109-1249&t=VhLpAdNQVklATuhW-1
- The label looks the same
- The (?) is the same
- The value is no longer an input box. 
- There is an edit button next to the value. 
  - Clicking the edit button opens the Override Modal


*Clarifications*
*QUESTION FROM PRODUCT TEAM:*
IF the user opens the Overrides Modal for a field that already has saved year-specific overrides, THEN should the YearOverrideList inputs initialize with the previously saved per-year override values (rather than re-copying the current Era Fact into every year)?
*ANSWER FROM NEFKO:* 
Yes, it would initialize with whatever they currently have with overrides. If they change any of the speciic years, and then hit save, THEN those overrides would update.

*QUESTION FROM PRODUCT TEAM:*
IF the user changes the Era Fact after some year-specific overrides already exist for that field, THEN should the overridden years keep their custom values while only the still-linked years update from the Era Fact?
*ANSWER FROM NEFKO:* 
WHEN the user has overrides, THEN they are NOT able to change the era facts for that one. I added details above.

*QUESTION FROM PRODUCT TEAM:*
IF the years in the era change after overrides have been created for a field, THEN what should happen to those saved overrides?
  - IF a new year is added to the era, should it start linked to the Era Fact by default?
  - IF a year is removed from the era, should its override value remain stored on that standalone year?
*ANSWER FROM NEFKO:* 
- IF the user ADDS a year to the era 
  - AND: the field DOES NOT have overrides: THEN the added year now defaults to what the Era has for that field
  - AND: the field DOES have overrides: THEN carry the old year's value into the override
- IF the user REMOVES a year from the era
  - THEN the field carries into that year.

*QUESTION FROM PRODUCT TEAM:*
For fields that are conceptually repeated items or summaries (for example "More income sources"), should this Step 3 year-specific override UI apply only to the primary numeric era-fact fields, or also to those composite / aggregated rows?
*ANSWER FROM NEFKO:* 
Let's not worry about this for now. 


**Implementation Plan**

- **Scope / rule of the step**
  - This step applies only to the current **simple numeric era-fact fields** that already render as amount rows in `EraFactsForm`.
  - It does **not** add override UI for summary / composite rows such as **“More income sources”**, nor for read-only derived rows such as **Available to Invest** or **Difference**.
  - It also does **not** add a new persistence boundary outside the current Era pane flow; instead, we should keep the existing mental model: edits live in the pane’s front-end draft, modal **Save** commits into that local draft, and the pane’s existing **Update** button persists the full scenario.

- **1. Move override state ownership up to `EraDetailPane`**
  - Step 3 can no longer keep override state as a local `Record<string, boolean>` inside `EraFactsForm`, because the feature now needs:
    - persisted year-specific values,
    - the overridden-row summary to render in the pane,
    - range-change carry-forward behavior,
    - and rehydration from already-saved year overrides in `scenario.years`.
  - `EraDetailPane` should become the owner of a draft override structure for the currently edited era, for example:
    - `draftOverridesByField: Partial<Record<YearFactsFieldKey, Record<number, number>>>`
  - This structure should represent only **fields that are currently overridden** for this era.
    - If a field key is present, the field is overridden.
    - If a field key is absent, that field is linked to the Era Fact.
  - On pane open, derive `draftOverridesByField` from the current `scenario.years` in the era range:
    - inspect each year’s `eraMetadata.overriddenFields`,
    - for any overridden `fieldKey`, read the actual numeric value from that year,
    - and build the per-year map from the persisted year inputs.
  - This directly matches the clarification:
    - reopening the modal for an already-overridden field should show the current saved per-year values, not a fresh copy of the Era Fact.

- **2. Introduce one shared field-definition registry**
  - Add a small helper module, e.g. `src/lib/eraOverrideFields.ts`, that defines one descriptor per overrideable numeric field.
  - Each descriptor should include:
    - `fieldKey: YearFactsFieldKey`
    - `fieldLabel: string`
    - `yearRowLabelSuffix: string`
    - `readEraValue(eraFacts): number`
    - `readYearValue(yearInput): number`
    - `writeYearValue(yearInput, value): YearInput`
  - For wages, keep one descriptor per income earner using the existing field-key pattern: ``wage-income-${member.id}``.
  - For the Step 3 scope, the registry should cover:
    - wage rows,
    - `dividend-income`,
    - `interest-income`,
    - `short-term-capital-gains`,
    - `long-term-capital-gains`,
    - `household-expenses`,
    - `taxes`,
    - `other-expenses`,
    - `traditional-retirement`,
    - `roth-retirement`,
    - `taxable-investments`.
  - Keep `modify-investment-details` out of this Step 3 modal because the ticket describes a **year list of numeric inputs**, not a per-year toggle UI.
  - This registry should be the one place that connects:
    - the Era pane row,
    - the override modal title,
    - the per-year list label,
    - and the service-layer writeback logic.

- **3. `EraOverridesModal` V2: structure + token mapping from Figma**
  - Keep the existing Step 2 modal shell, but add a conditional **YearOverrideList** below the toggle when the draft is ON.
  - **Modal shell** (Figma node `110:1742`)
    - Background: `bg-bg-primary`
    - Outer radius: `rounded-[16px]`
    - Outer shadow: use the same modal shell shadow already used in `EraOverridesModal` / other era modals so we stay visually aligned with Figma’s `shadow-md` without introducing a one-off new shadow recipe.
    - Close button icon color: `text-text-secondary`
    - Close button hover surface: `hover:bg-bg-primary-hover`
    - Close button hover text: `hover:text-text-primary`
    - Focus ring: `focus-visible:ring-input`
  - **Header block** (`HeaderBlock`, node `110:1429`)
    - Title `{fieldLabel}`: `text-h5 text-text-primary`
    - Subtitle `{era name} Era, {start} - {end}`: `text-body-2 text-text-tertiary`
    - Gap between title and subtitle: `gap-1`
    - Vertical padding: `py-4`
  - **Override toggle block** (`OverrideToggleBlock`, node `110:1396`)
    - Top and bottom border: `border-y border-border-tertiary`
    - Toggle title: `text-body-1 font-semibold text-text-primary`
    - Toggle subtitle: `text-body-2 text-text-tertiary`
      - Important: the full Step 3 Figma (`109:1369`) uses **tertiary** text here, so for Step 3 we should align to `text-text-tertiary`, not the earlier Step 2 fallback of secondary.
    - Toggle OFF track: `bg-bg-tertiary`
    - Toggle ON track: `bg-accent-primary`
      - This is the current Velella semantic alias for the Figma **brand solid teal**.
    - Toggle thumb: `bg-bg-primary`
    - Toggle focus ring: `focus-visible:ring-input`
  - **YearOverrideList** (`110:1282`)
    - Container padding: `py-4`
    - Row gap: `gap-2`
  - **YearOverrideListItem** (`109:1556` and siblings)
    - Row height: `h-10`
    - Horizontal padding: `px-1`
    - Row layout: `flex items-center justify-between`
    - Left label text (`2030 Wages`, etc.): `text-body-1 text-text-primary`
    - Right input should reuse the same amount-input visual system as the rest of the app:
      - input background: `bg-bg-primary`
      - input border: `border-border-primary`
      - input radius: `rounded-md`
      - input text color: `text-text-placeholder`
      - input focus ring: `focus-visible:ring-input`
      - input shadow: keep the existing input shadow treatment already used by the shared amount input / form-control override layer so we do not hardcode a second input chrome just for this modal
    - Width should remain the same current amount-input width (`187px` in Figma, already matching the current `EraPaneAmountInput` width).
  - **Action bar** (`110:1729`)
    - Top border: `border-t border-border-secondary`
    - Cancel button: existing Counterfoil `Button` `variant="tertiary"` `size="lg"`
    - Save button: existing Counterfoil `Button` `variant="primary"` `size="lg"`

- **4. `EraOverridesModal` V2: behavior**
  - The modal should receive a single field descriptor plus:
    - `eraNickname`
    - `eraStartYear`
    - `eraEndYear`
    - `eraYears: number[]`
    - `isInitiallyOverridden: boolean`
    - `initialYearValues: Record<number, number>`
  - Modal-local draft state should stay inside the modal until its **Save** button:
    - `draftEnabled`
    - `draftValuesByYear`
  - On open:
    - IF the field already has overrides, initialize `draftEnabled = true` and use the currently saved per-year values.
    - IF the field does not yet have overrides, initialize `draftEnabled = false`.
  - WHEN the user toggles OFF -> ON inside the modal:
    - seed `draftValuesByYear` from the current Era Fact value for each year in the era.
  - WHEN the user toggles ON for a field that already has saved overrides:
    - do **not** re-seed; keep the existing per-year values.
  - The per-year input list should render only when `draftEnabled === true`.
  - Modal **Cancel** / **X**:
    - discard modal-local edits and close.
  - Modal **Save**:
    - commit the modal draft back to `EraDetailPane`’s `draftOverridesByField`,
    - then close.

- **5. Render overridden rows in `EraFactsForm`**
  - `EraFactsForm` should no longer assume every editable numeric field renders as `EraPaneAmountInput`.
  - For each field descriptor:
    - IF the field is linked, render the current `EraPaneAmountInput` exactly as today.
    - IF the field is overridden, render a new read-only row value area that shows:
      - a non-editable summary string,
      - and a small edit button that reopens the overrides modal.
  - Add a narrow component for that right-side display, e.g. `EraPaneOverrideSummary.tsx`, instead of making `EraFactsForm.tsx` more condition-heavy.
  - The summary string should be:
    - a single formatted currency when all overridden years have the same value,
    - otherwise a min-max range such as `$95,000 - $110,000`.
  - While a field is overridden, the Era Fact row for that field should no longer be editable from the main pane.
    - This matches the clarification: once a field has overrides, the user is **not** editing the Era Fact for that field from the main Era pane row.

- **6. Overridden-row styling + token mapping**
  - For the row state shown in Figma node `109:1249`:
    - Label text stays the same: `text-body-1 text-text-primary`
    - Help button stays the same existing `EraPaneHelpButton` treatment:
      - icon color `text-text-secondary`
      - hover surface `hover:bg-bg-primary-hover`
      - hover icon `hover:text-text-primary`
      - focus ring `focus-visible:ring-input`
    - Override summary text should use `text-body-1 text-text-quaternary`
      - This is the best semantic match to Figma’s `text-quaternary`.
      - IF `text-text-quaternary` is not currently exposed by Counterfoil’s utility layer, we should treat that as a **Counterfoil token gap** and add the semantic token there rather than hardcoding a gray just for Velella.
    - Edit button should be a micro action, not a full secondary button:
      - icon color `text-text-secondary`
      - hover surface `hover:bg-bg-primary-hover`
      - hover icon `hover:text-text-primary`
      - focus ring `focus-visible:ring-input`
      - keep the hit target compact and circular, consistent with the help affordance.

- **7. Save pipeline in `EraDetailPane`**
  - The pane’s existing **Update** button remains the true persistence boundary.
  - On pane Update:
    1. call `updateEra(...)` with the current `draft` so the Era Facts and range changes cascade first,
    2. then apply `draftOverridesByField` back onto the resulting scenario years,
    3. then call `onSave(updatedScenario)`.
  - Add a small pure service helper, e.g. in `eraService.ts` or `lib/eraOverrides.ts`, that applies a full field-override draft to a scenario:
    - ensure each overridden year includes the `fieldKey` in `eraMetadata.overriddenFields`,
    - write the per-year numeric value onto the right `YearInput` field,
    - and relink fields that are no longer overridden so the year snaps back to the Era Fact.
  - This helper should be the only place that mutates year-level override metadata for the Era pane flow.

- **8. Era range changes while editing**
  - Because product clarified range behavior, the override-draft layer must be range-aware.
  - IF a field has no overrides and the era range expands:
    - the new year should follow the Era Fact by default.
  - IF a field does have overrides and the era range expands:
    - carry the previous edge override value into the newly added year(s).
    - Concretely:
      - years added before the old start year copy the old start year’s override value,
      - years added after the old end year copy the old end year’s override value.
  - IF a year is removed from the era:
    - `updateEra(...)` already leaves the year’s resolved values behind when stripping `eraMetadata`,
    - so the save pipeline should not overwrite that standalone year afterward.
    - It should simply stop including that year in the modal list and in the in-era override map.

- **9. Expected files to touch**
  - `velella/src/components/General/EraDetailPane.tsx`
    - lift override draft state here and apply it on final Update
  - `velella/src/components/General/EraFactsForm.tsx`
    - switch rows between linked-input vs overridden-summary rendering
  - `velella/src/components/General/EraOverridesModal.tsx`
    - add the year list UI and modal-local year-value draft state
  - `velella/src/components/General/EraPaneAmountInput.tsx`
    - keep shared amount-input styling, but allow safe reuse inside the modal list
  - `velella/src/components/General/EraPaneOverrideSummary.tsx`
    - new tiny component for the overridden row’s right side
  - `velella/src/lib/eraOverrideFields.ts`
    - new field descriptor registry
  - `velella/src/services/eraService.ts`
    - add helper(s) that apply a field-override draft back onto scenario years
  - Optional if `eraService.ts` starts getting too large:
    - extract the new override-application helpers into `velella/src/lib/eraOverrideDraft.ts`

- **10. Test coverage**
  - Add a focused unit test file for the new override-application helper, e.g. `velella/src/lib/eraOverrideDraft.test.ts` or `velella/src/services/eraService.test.ts`.
  - Cover at least:
    - rehydrating existing per-year overrides,
    - toggling a field from linked -> overridden seeds all years from the current Era Fact,
    - saving custom year values writes the year values + `overriddenFields`,
    - toggling overridden -> linked removes the field key and reapplies the Era Fact,
    - expanding the era range while overrides exist carries the edge value into new years,
    - removing a year from the era leaves the resolved year value behind.

- **Design philosophy ([design philosophy](/0_resources/design_philosophy.md))**
  - **Consistent with:** keeping override-specific logic out of the modal body and in a small helper / registry layer, reusing semantic tokens from Counterfoil instead of raw Figma hex values, and extracting a tiny overridden-row component rather than adding another large conditional branch inside `EraFactsForm`.
  - **Consistent with:** keeping `year` as the canonical resolved data object while `era` remains the authoring object; the plan writes year-specific overrides back onto `scenario.years`, which matches the PRD’s dumb-push model.
  - **Watch / mild tension:** `EraDetailPane.tsx` and `EraFactsForm.tsx` are both already getting large. If the override draft wiring starts making either file sprawl, extract the stateful logic into a hook such as `useEraOverrideDrafts` rather than letting either component become a god file.
  - **Counterfoil note:** if `text-text-quaternary` or any equivalent semantic utility needed for the Figma row state is missing from the design-system layer, that should be treated as a **Counterfoil kit improvement** instead of solved with a Velella-only hardcoded color.



--------------------------------------------------

## **Step 4: Override Modal: Toggle Off Input**
View the figma here: https://www.figma.com/design/U6nhz5NqWRFSnKvHHxOUSG/1-Ok?node-id=111-1746&t=VhLpAdNQVklATuhW-1
Specifically the EraInput: https://www.figma.com/design/U6nhz5NqWRFSnKvHHxOUSG/1-Ok?node-id=111-1754&t=VhLpAdNQVklATuhW-1

WHEN the user clicks an unlink button to open the Overrides Modal
AND: the "overrides" are toggled OFF on the Overrides Modal
THEN: the EraInput displays.

The EraInput is a single row that controls the value for all years. 
It is just another input for the one on the EraDetailPane.
It displays whatever the Era value is, and enables the user to change it.

WHEN it changes:
- IF the user changes the Era value in the modal
  THEN: the change does not occur unless they push the "save" button on the OverrideModal
(this is a duplicative action with what the user can do on the Era pane. We're just putting it here as well because it feels right. )

*Clarifications*
{}

*Implementation Plan:*

- **Scope / rule of this step**
  - This step changes the **`draftEnabled === false`** state inside `EraOverridesModal`.
  - Instead of showing nothing between the toggle block and the action bar, the modal should show a single **EraInput** row that edits the **era-level value** for the selected field.
  - The user is still editing **front-end draft state only** until the modal **Save** button is pressed.
  - This is intentionally duplicative of the value on the main `EraDetailPane`, but it does **not** create a second persistence boundary:
    - modal **Save** commits into the pane draft
    - pane **Update** remains the true scenario persistence action.

- **Behavior**
  - WHEN the modal opens for a field that is currently **linked**:
    - initialize the off-state EraInput with the current Era Fact value for that field.
  - WHEN the modal opens for a field that is currently **overridden** and the user toggles **ON -> OFF**:
    - replace the year-specific list with the single EraInput
    - initialize that EraInput from the current Era Fact value for the field, not from any one overridden year value.
  - WHEN the user edits the EraInput while overrides are OFF:
    - keep that value in **modal-local draft state** only.
  - WHEN the user presses **Save** while overrides are OFF:
    - write the modal’s linked-value draft back into `draft.eraFacts`
    - remove that field from `draftOverridesByField`
    - close the modal.
  - WHEN the user presses **Cancel** or **X**:
    - discard the linked-value draft exactly the same way we already discard the per-year draft.

- **State and data flow**
  - Extend `EraOverridesModal` so it owns **two** local draft branches:
    - `draftEnabled`
    - `draftLinkedValue`
    - plus the existing `draftValuesByYear`.
  - Add a new prop for the current era-scoped value, for example:
    - `initialLinkedValue: number`
  - Change the modal save contract so the parent can distinguish the two save paths. For example:
    - `enabled === true` -> save `valuesByYear`
    - `enabled === false` -> save `linkedValue`
  - Keep `EraFactsForm` as the adapter between modal output and the parent pane:
    - on **linked** save, call `onUpdateEraFacts(...)` for the selected field and `onSaveFieldOverrides(fieldKey, null)`
    - on **overridden** save, keep the current `onSaveFieldOverrides(...)` behavior and do **not** mutate `eraFacts`.
  - Keep `EraDetailPane` as the owner of the authoritative pane draft, so Step 4 still aligns with the PRD’s dumb-push model.

- **UI structure (from Figma step 4)**
  - Insert a new middle block between the toggle section and the action bar when overrides are OFF.
  - The block should be a single row with:
    - left side: a label describing the era-scoped value
    - right side: the same amount-input visual treatment already used elsewhere in the pane.
  - For the left label, use the selected field’s label plus the current era range on a second line or wrapped block, following the Figma intent of:
    - `{field label},`
    - `{era start} - {era end}`
  - Reuse semantic tokens already present in the existing modal/input system:
    - container `py-4`
    - row `flex items-center justify-between px-1`
    - divider + action bar unchanged from Step 3.

- **Style tokens / semantic mapping**
  - Keep the existing **modal shell** exactly aligned with Step 3:
    - background `bg-bg-primary`
    - border `border-border-secondary`
    - outer radius `rounded-[16px]`
    - shell shadow: reuse the current modal shadow already in `EraOverridesModal.tsx` rather than introducing a new one-off recipe.
  - Keep the existing **toggle band** exactly aligned with Step 3:
    - band borders `border-y border-border-tertiary`
    - title `text-body-1 font-semibold text-text-primary`
    - subtitle `text-body-2 text-text-tertiary`
    - toggle OFF track `bg-bg-tertiary`
    - toggle ON track `bg-accent-primary`
    - toggle thumb `bg-bg-primary`
    - focus ring `focus-visible:ring-input`
  - For the new **EraInput container** (`draftEnabled === false`):
    - wrapper padding `py-4`
    - row layout `flex items-center justify-between px-1`
    - no extra background fill; keep it on the modal surface `bg-bg-primary`
  - For the new **EraInput left-side label block**:
    - primary text `{fieldLabel}, {era range}` should use `text-body-1 text-text-primary`
    - if rendered as two lines, both lines stay on the same semantic text color `text-text-primary`
    - do not introduce raw black/gray values from the Figma export.
  - For the new **EraInput right-side value control**:
    - reuse `EraPaneAmountInput` so the input keeps the app’s existing semantic chrome
    - input background `bg-bg-primary`
    - input border `border-border-primary`
    - input radius `rounded-md`
    - input text `text-text-placeholder`
    - input focus ring `focus-visible:ring-input`
    - input shadow: reuse the current shared amount-input / form-control shadow treatment; do not hardcode a second modal-specific input style.
  - For the **close button / action bar**:
    - close icon color `text-text-secondary`
    - close hover surface `hover:bg-bg-primary-hover`
    - close hover text `hover:text-text-primary`
    - action bar top border `border-t border-border-secondary`
    - Cancel button: existing Counterfoil `Button` `variant="tertiary"` `size="lg"`
    - Save button: existing Counterfoil `Button` `variant="primary"` `size="lg"`

- **Component/file structure**
  - `EraOverridesModal.tsx` is already larger than our preferred file size, so Step 4 should avoid adding another large conditional block inline if possible.
  - Extract a tiny presentational row component, e.g. `EraOverrideLinkedInputRow.tsx`, that renders:
    - the left-side era label/range text
    - the right-side `EraPaneAmountInput`
  - Keep formatting helpers small and pure:
    - a helper to build the era-range label string
    - optional fallback copy when start/end years are still unset.
  - `EraPaneAmountInput.tsx` should stay the shared input chrome; no second money-input implementation should be introduced for this modal.

- **Expected files to touch**
  - `velella/src/components/General/EraOverridesModal.tsx`
    - add off-state linked input rendering and new modal-local draft value
  - `velella/src/components/General/EraFactsForm.tsx`
    - pass `initialLinkedValue`
    - handle the new save result shape by updating `eraFacts` when overrides are OFF
  - `velella/src/components/General/EraPaneAmountInput.tsx`
    - only if a tiny API adjustment is needed for cleaner reuse in the linked-input row
  - `velella/src/components/General/EraOverrideLinkedInputRow.tsx`
    - likely new, small presentational component to keep the modal file from growing further.

- **Test coverage**
  - Add or update focused tests around the modal save behavior so we cover:
    - linked field opens with the current Era Fact value
    - toggling overridden -> linked shows the single EraInput
    - editing the linked value and pressing **Save** updates the pane draft era value and removes overrides for that field
    - pressing **Cancel** leaves both the Era Fact draft and override draft unchanged.

- **Design philosophy ([design philosophy](/0_resources/design_philosophy.md))**
  - **Consistent with:** keeping the pane draft as the single source of truth, reusing the shared amount-input styling instead of creating a second bespoke money field, and extracting a tiny row component instead of making `EraOverridesModal.tsx` even more monolithic.
  - **Watch / mild tension:** Step 4 makes `EraFactsForm.tsx` do more save-path branching for the modal. If that branching starts to spread, the next cleanup should be a small override-modal adapter hook or helper rather than continuing to grow the form component.



--------------------------------------------------

## **Step 5: Bug: Era changes are not rippling through table**
Expected Behaviour:
- IF: a user changes a value in an Era on the EraDetailPane is updated (example, un-toggling the overrides and saving)
- THEN: all of those values for those years should be updated in the yaml, and the table should be reflective of that. 

Bug:
- WHEN I change a household member wages on the EraDetailPane
- THEN: the table isn't updating.
(it looks like the yaml is getting updated, but the table is not getting updated)

*Hypothesis and proposed fix:*
- *Hypothesis:*
  - The era save path itself is probably working. `updateEra(...)` already cascades era-fact changes into `scenario.years`, and `applyEraOverrideDraftToScenario(...)` has test coverage for the relink case where a field is toggled back OFF and should snap back to the era value.
  - The stale table is more likely a state-propagation bug between pages/components: `EraDetailPane` saves an updated local scenario, but the app-level shared `scenario` is only updated after `useScenario.persist()` finishes awaiting the PUT request.
  - That means the YAML can be correct while the Timeline table is still rendering from an older in-memory scenario snapshot.

- *Proposed fix:*
  - Make `useScenario.persist()` optimistic, the same way `useScenario.save()` already is:
    - call `setScenario(updated)` before awaiting `saveScenario(updated, scenarioId)`
    - optionally keep the previous scenario in memory so we can roll back if the request fails
  - This should make the app-level `scenario` the immediate shared source of truth, so era edits ripple into the Timeline table as soon as the user clicks `Update`, instead of only after the async save round-trip completes.
  - QA this specifically by:
    - editing an Era value on the Narrative page
    - clicking `Update`
    - immediately checking the Timeline table
    - confirming the year rows now reflect the updated wage / income / expense values without requiring a reload