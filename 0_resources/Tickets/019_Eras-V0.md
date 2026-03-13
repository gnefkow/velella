# **Eras "Version 0"**
---------------------------------------------------------------------------
In this ticket, we:
- Create the `era` logic and component on the back end. 
- Create a VERY minimal UI on the front-end. This UI doesn't have to be perfect or the best usability, it is simply a V0. We are not over-designing it or optimising usabiliy, we're just getting a mark on the canvas. 


## **User Stories**:
---------------------------------------------------------------------------
As a User, I can: 
- Create an Era
- View a list of my Eras on the Narrative Page
- View the details of an Era
- Edit an Era
- Delete an Era
- Toggle an override on a `YearFacts` pane. 






## **Building the Back End Logic**
---------------------------------------------------------------------------
The back-end logic is outlined in the [Years and Eras document](/0_resources/PRD/Years-and-Eras.md).



## **View a List of my Eras**
Eras are visible on the `NarrativePage` component as a list of `EraLI.tsx` (era list item) components.
There is one `EraLI` for each `era`.
If there are no eras, the page shows a message that says "No eras, create one".
When there are `eras`, the `ErasList.tsx` component renders on the page with the `EraLI`s in a vertical list. Use Counterfoil layout primitives (e.g. `Stack`) for the list layout.
- The `EraLI`s are listed in ascending order by `startYear`, with the earliest starting `era` at the top and the latest starting `era` at the bottom.
- The `EraLI` displays:
  - Era Nickname
  - Era Start Year and Era End Year (in one line: "`era-start-year` - `era-end-year`")

## **View the details of an Era**
- Clicking on an `EraLI` opens the `EraDetailPane.tsx`
- The `EraDetailPane` displays on the right side of the page. Use Counterfoil layout primitives (e.g. `Stack`) for the pane layout.
- Sticky to the top is a close button that closes the pane. 
- Sticky to the bottom of the pane is a "save" button
  - The "save" button is only actionable when something in the `era` has changed.
  - IF the user makes a change in the Era Detail Pane and attempts to close the pane without saving, a pop-up modal displays that says "do you want to save" with two buttons:
    - Primary Button: Save Changes - saves the changes to the Era and closes the `EraDetailPane`
    - Secondary button: Discard Changes - discards the changes and closes the `EraDetailPane`
- The `EraDetailPane` has:
  - Nickname Field - Users can name (or rename) the `era`
  - Date Range Selector: two drop-downs: one to select the `startYear` and one to select the `endYear`
    - The dropdowns include the years in `assumptions`.
    - Years that are already part of a different `era` are shown as disabled, with a note that says they are part of that `era`.
    - For `startYear`, years after the currently selected `endYear` are disabled.
    - For `endYear`, years before the currently selected `startYear` are disabled.
    - NOTE: It is possible to have a one-year `era` where `startYear` and `endYear` are the same.
  - All of the same fields as the YearFactsPane. (income for each household member, household expenses, etc...)
  - Era Description: a text area. It is at the bottom of the Detail Pane. 
- WHEN a user edits the details of an era and clicks the "Save" button
  - THEN: all of the `years` that are included in that `era` are updated, meaning specifically:
    - All of the fields in each `year` of the range that do not have an override in place will be updated with the new values pushed from the Era. 
    - Newly added years receive the `era` values when the user clicks save.
    - Years removed from the `era` keep the values they had at the moment they were removed, but they are no longer linked to the `era`.

## **Create an era**
- There is a "Create Era" button on the NarrativePage. 
  - The button is in the upper right corner
  - the button is size: md, hierarchy: secondary
- Clicking the button opens a blank `EraDetailPane `
- Users cannot "save" the new era unless it has BOTH:
  - A year range (both a `startYear` and `endYear`)
  - An era nickname
- WHEN the user saves a new `era`, any included `year`s immediately receive the `era` values for all non-overridden fields.

## **Delete an era**
- There is a trashcan button (tertiary button) in the upper right of the `EraDetailPane`
- Clicking the button triggers a modal that says "Are you sure you want to delete {Era-Name}?"
  - Options: 
    - Destructive: "Yes, delete it"
      - Immediately deletes the era and closes the detail pane
    - Tertiary: "Nevermind, don't delete it!"
      - Closes the modal and returns the user to the page with the Detail Pane still open. 
- Deleting an `era` does not clear the values on the affected `year`s. Those `year`s keep the resolved values they already have; they are simply no longer linked to the deleted `era`.

## **Override a Field in a Year**
WHEN a `year` is part of an `era`, THEN the `YearFactsField`s of that year in the `YearFactsPane` display in a new state called `era-locked`. 
- In the `era-locked` state:
  - The input field is disabled
  - The disabled fields still show the value, just the user can't change it.
  - There is an `override` button on the right of the field
    - The button is tertiary, size=md, icon-only, the icon is a broken link
- Clicking the Override button:
  - Immediately creates an override in the back end for that field.
  - Changes the state of the `YearFactsField` to `era-override`.
- In the `era-override` state, the list item:
  - The field can now be edited 
  - Editing that field behaves the same as before in the `YearFactsPane` (it immediately updates)
  - There is a tertiary button on the right of the field: the `re-link-to-era` button
    - hierarchy: tertiary, size: md, icon-only, icon: refresh icon (the two arrows in a circle)
- Clicking the `re-link-to-era` button:
  - Immediately resets the field to the value currently defined in the `era`
  - Changes the `YearFactsField` back to the `era-locked` state. 




## **Clarification Questions:**
---------------------------------------------------------------------------
**Q:** Should `era` fact edits cascade to the included `year`s immediately as the PRD describes, or only when the user clicks the `Save` button in `EraDetailPane`?
**A:** Only when the user clicks "save."

**Q:** When creating a new `era` over years that already have standalone values, should saving the `era` overwrite all non-overridden fields in those years right away?
**A:** Yes. We might add some friction here later, but we will not worry about that in this ticket.

**Q:** When editing an existing `era`'s range...
- should newly added years immediately adopt the `era`'s values,
  - **A:** Only after the user clicks "save."
-  and should removed years keep their current resolved values exactly as they are?
   - **A:** Yes. If a year is removed from the `era`, it retains the values it had. It is just no longer locked to the `era`.


**Q:** In V0, does "all of the same fields as the `YearFactsPane`" literally mean every current `YearFacts` input, or is there a smaller subset we should ship first?
**A:** Literally all of the same inputs.

**Q:** Should the per-field `override` and `re-link-to-era` actions persist immediately, or should they wait for a pane-level save action?
**A:** Immediate.

**Q:** For the year-range dropdowns, should years that are already used by another `era` be hidden entirely or shown as disabled options?
**A:** Show them as disabled. There is a note that says "Part of {era name they are in}."




## **Implementation Plan**
---------------------------------------------------------------------------
### 1. Define the `era` data model and pure helpers
- Add a small `era` domain model that keeps narrative data (`id`, `nickname`, `description`), range data (`startYear`, `endYear`), and `eraFacts`. Use `eraFacts` in code; use `era-facts` in persisted YAML only.
- Keep `year` as the canonical planning object; `era` is only a bulk-authoring and narrative layer.
- Add pure helper modules for:
  - sorting eras by `startYear`
  - collecting the list of years in a range
  - checking whether a proposed range overlaps another `era`
  - computing which years are selectable in the start/end dropdowns, including the "disabled because part of another era" state

### 2. Define how `year` tracks `era` inheritance
- Add lightweight metadata on each `year` so the UI can tell:
  - whether the year belongs to an `era`
  - which individual fields are still linked to the `era`
  - which fields have been overridden locally on the `year`
- Keep this metadata strictly for editing behavior; calculations should continue to read resolved `year` facts only.
- Store overrides at the field level, since that is now a confirmed product rule.

### 3. Build `era` update services outside the UI
- Create small service/helper functions for the core mutations:
  - `createEra`
  - `updateEra`
  - `deleteEra`
  - `applyEraToYears`
  - `createYearFieldOverride`
  - `relinkYearFieldToEra`
- `createEra` and `updateEra` should only push values into included years when the user clicks the pane-level `Save` button.
- When an `era` is saved:
  - all included years receive the `era` values for any fields that are not overridden
  - newly added years adopt the `era` values at save time
  - removed years keep the resolved values they already have
- `deleteEra` should remove the `era` object and unlink the years, while leaving their resolved values untouched.
- The per-field override and re-link actions in `YearFactsPane` should persist immediately.

### 4. Add validation rules for create/edit flows
- Users cannot save a new `era` unless it has:
  - a nickname
  - a valid `startYear`
  - a valid `endYear`
- Validation should enforce:
  - years must stay within assumptions
  - `startYear` cannot be after `endYear`
  - `endYear` cannot be before `startYear`
  - no year can belong to more than one `era`
- The dropdown UI should still show conflicting years, but in a disabled state with a note that says they already belong to another `era`.

### 5. Build the minimal Narrative Page list UI
- Add an `ErasList` area to `NarrativePage`.
- Use Counterfoil layout primitives (e.g. `Stack`) for the vertical list of `EraLI`s and for the layout of each `EraLI` (nickname + year range).
- Render:
  - a secondary `Create Era` button in the upper-right
  - an empty state message when there are no eras
  - one `EraLI` per `era`, sorted by `startYear`
- Keep `EraLI` narrow in scope: it should only display nickname and year range, and notify the parent when clicked.

### 6. Build a modular `EraDetailPane`
- Split the detail UI into small components instead of one large pane file.
- Use Counterfoil layout primitives (e.g. `Stack`) for the pane structure (header, form fields, save button).
- Suggested pieces:
  - `EraDetailPane`
  - `EraHeader`
  - `EraRangeFields`
  - `EraNarrativeFields`
  - `EraFactsForm`
  - `EraDeleteModal`
  - `EraUnsavedChangesModal`
- The pane should support both create and edit modes.
- The pane includes:
  - close button at the top
  - trash button for existing eras
  - nickname input
  - start/end year dropdowns
  - all of the same editable fact inputs as `YearFactsPane`
  - description textarea at the bottom
  - save button pinned at the bottom
- Pane-local draft state is appropriate here, since `era` changes should not cascade until save.

### 7. Reuse `YearFacts` form pieces where possible
- Do not duplicate the `YearFactsPane` field definitions by hand if the current code already has a reusable structure for those inputs.
- Extract shared field rendering or shared field config only as far as needed to let both `YearFactsPane` and `EraFactsForm` use the same fact inputs.
- Keep business logic in helpers/services, not inside the pane components.

### 8. Add `era` lock state to `YearFactsPane`
- When a `year` belongs to an `era` and a field is still linked:
  - render that field in the `era-locked` state
  - disable direct editing
  - show the override button
- When a field is overridden:
  - render it in the `era-override` state
  - allow editing
  - show the re-link button
- This state should be driven by explicit `year` metadata, not inferred indirectly from comparing values.

### 9. Handle close, save, and delete interaction rules
- If the user tries to close `EraDetailPane` with unsaved draft changes, show the save/discard modal.
- Save-and-close should persist the `era`, cascade values to the included years, then close the pane.
- Discard should drop the draft changes and close the pane.
- Delete confirmation should be a separate modal with destructive confirmation, then close the pane after deletion.

### 10. Cover the V0 behavior with focused tests
- Add unit tests for the pure `era` helpers and services:
  - sorting
  - range expansion
  - overlap validation
  - save-time cascade behavior
  - removing years from an `era`
  - deleting an `era`
  - field-level override and re-link behavior
- Add a few integration/component tests for:
  - disabled save on incomplete `era`
  - opening an existing `era` from the list
  - unsaved-changes modal behavior
  - immediate override/re-link behavior in `YearFactsPane`

### 11. Design philosophy check
- Consistent with the design philosophy:
  - Break the feature into many small files: domain helpers, mutation services, pane subcomponents, and list items.
  - Keep business rules in pure helpers/services rather than burying them in React components.
  - Reuse existing `YearFacts` UI building blocks instead of creating a parallel, inconsistent form system.
  - Use Counterfoil Kit primitives (including layout primitives such as `Stack`) and semantic styling tokens for the V0 UI.
- Inconsistent with the design philosophy:
  - If we copy the full `YearFactsPane` implementation into `EraDetailPane` instead of extracting shared pieces, we would create duplicate logic and a harder-to-maintain form system.
  - If we put all `era` mutations, validation, and pane state into one `NarrativePage` file, we would create the kind of large, condition-heavy component this project tries to avoid.