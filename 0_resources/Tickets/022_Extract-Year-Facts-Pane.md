# Overview
We want the YearFactsPane to be accessible from the Timeline page as well. This means two things:
- **In the interface**, we can open the YearFacts Pane from the Timeline tab. 
- **In our code** we want to move the component(s) for year facts pane to the general folder. 


## **Code Move**
--------------------------------------------------
Move:
- `EraDeleteModal.tsx` to `components/General`
- `EraDetailPane.tsx` to `components/General`
- `EraFactsForm.tsx` to `components/General`
- `EraNarrativeFields.tsx` to `components/General`
- `EraUnsavedChangesModal.tsx` to `components/General`
- Audit the code to make sure that nothing gets broken in this transition. 


DO NOT MOVE:
- `EraLI.tsx`
- `ErasList.tsx`

## **YearFactsPane from Timeline Tab**
--------------------------------------------------
We want to be able to open YearFactsPane from BOTH the Narrative tab and the Timeline Tab. 
Specifically:
- *On Narrative tab*: NOTHING CHANGES. We can still open the pane as before. 
- *On the TimelinePage*: the YearFactsPane is no longer open by default. 
- *ON the Timeline Page*, WHEN the user clicks on either: (1) the header for an Era, or (2) the row of a year in an era that does NOT have any overrides
  - THEN: the EraDetailPane opens on the right side of the screen. 
    - The div holding the table gets smaller horizontally to accomodate the pane. 
- *ON the Timeline Page*, WHEN the user clicks on either: (1) a year row for a year that is NOT in an era, or (2) a year row for a year that is in an era but has an override
  - THEN: The YearFactsPane opens for that year
  - *the pane opens on the RIGHT side of the screen* (this is an update, we're changing it to the right from the left.)
- A YearFactsPane and a EraDetailPane will never be open at the same time. 
  - IF one pane is open and the user selects something else from the table, THEN the pane closes and the other pane opens. 
  - IF there are unsaved changes in the era pane that was open, THEN the "EraUnsavedChangesModal" displays before the pane navigation occurs, giving the user an opportunity to save or cancel their changes. 



*Clarifications*

*Q1:* On Timeline, if a user clicks an era header while `YearFactsPane` has unsaved edits, should we show a YearFacts unsaved-changes modal (if one exists), auto-save, or discard silently?
*A1:* show the modal. 

*Q2:* For the timeline rule "year row in an era that does NOT have overrides -> open `EraDetailPane`", can you confirm that a year with even one override field should always open `YearFactsPane` instead?
*A2:* Yes, a year with even one override will show YearFactsPane

*Q3:* When clicking a different era/year while `EraDetailPane` has unsaved changes and `EraUnsavedChangesModal` appears, what should happen after "Cancel" (stay on current era pane, or close pane and keep table selection unchanged)?
*A3:* if the user selects "cancel," THEN: the changes are discarded, the pane closes, and the other pane (that the user was trying to open) now opens. 

*Q4:* Should deep-link/query-param behavior change so Timeline can open directly to a specific pane (`EraDetailPane` or `YearFactsPane`), or should this remain local UI state only?
*A4:* We do not need to worry about URLs, it should just a UI state thing. 

*Q5:* For the code move to `components/General`, do you want us to keep current file names exactly as-is, and only update import paths (no component/API renames)?
*A5:* Keep the file names as they are, just update the paths. 

*Q6:* Should `EraDetailPane` and `YearFactsPane` use the same width on Timeline, or should each keep its current width behavior?
*A6:* They should use the same width everywhere. 



----------------------------------------------------------------------------------------------------
*IMPLEMENTATION PLAN*
- **Goal**
  - Enable Timeline to open either `EraDetailPane` or `YearFactsPane` on demand (never both at once), while keeping Narrative behavior unchanged.
  - Move era-detail-related pane components into `components/General` with no renames and no API changes.

- **Scope**
  - In scope:
    - Timeline pane-open behavior, pane switching behavior, unsaved-change modal flow, right-side placement, and table-width resize when a pane is open.
    - File moves:
      - `EraDeleteModal.tsx` -> `components/General`
      - `EraDetailPane.tsx` -> `components/General`
      - `EraFactsForm.tsx` -> `components/General`
      - `EraNarrativeFields.tsx` -> `components/General`
      - `EraUnsavedChangesModal.tsx` -> `components/General`
    - Import path updates and compile/runtime audit.
  - Out of scope:
    - URL/query-param deep-link behavior (explicitly local UI state only).
    - Renaming components, files, or props.
    - Moving `EraLI.tsx` or `ErasList.tsx`.

- **Functional Rules to Implement**
  - Timeline default state:
    - Timeline loads with no side pane open by default.
  - Selection-to-pane routing:
    - Open `EraDetailPane` when user clicks:
      - era header, OR
      - year row inside an era that has **zero** overrides.
    - Open `YearFactsPane` when user clicks:
      - year row not in any era, OR
      - year row in an era with **>=1** override.
  - Single-pane invariant:
    - Exactly one of these can be open at a time: `EraDetailPane`, `YearFactsPane`, or neither.
  - Pane position + width behavior:
    - Both panes open on the right side.
    - Both panes use the same width behavior everywhere.
    - Table container shrinks horizontally when either pane is open.
  - Unsaved changes behavior:
    - If leaving `EraDetailPane` with unsaved era changes, show `EraUnsavedChangesModal`.
    - If leaving `YearFactsPane` with unsaved year changes, show YearFacts unsaved-changes modal.
    - Per clarification: user choosing "cancel" in the era unsaved modal means discard changes, close current pane, and continue to the target pane the user selected.

- **Implementation Steps**
  - 1) Identify current ownership of pane state
    - Locate Timeline page state for selected row/era/year and existing pane-open logic.
    - Confirm where Narrative currently opens `YearFactsPane` so we preserve unchanged behavior.
  - 2) Extract/normalize pane state model (Timeline only)
    - Use explicit pane discriminator (e.g., `none | era | year`) plus selected payload.
    - Centralize click-routing logic into a small helper so override checks are not duplicated.
  - 3) Implement click routing on Timeline table interactions
    - Era header click -> route to era pane.
    - Year row click -> evaluate `hasOverrides(year)` and route accordingly.
  - 4) Implement single transition path between panes
    - On any selection change, close current pane and open target pane through one transition function.
    - Gate transition with unsaved-change checks when needed.
  - 5) Unsaved-change modal integration
    - Reuse current modal behavior patterns for both pane types.
    - Ensure modal outcome dispatches to "proceed + discard + open target pane" per clarification.
  - 6) Layout behavior update
    - Ensure right-side pane placement for both pane types.
    - Normalize pane width class/constant so both panes share the same width.
    - Ensure table width responds consistently when pane visibility toggles.
  - 7) Component file moves and import updates
    - Move the five listed files into `components/General`.
    - Update all imports (Timeline, Narrative, and any shared modules/tests).
    - Keep filenames and component APIs unchanged.
  - 8) Audit + cleanup
    - Remove dead imports/unused branches created by routing changes.
    - Verify no accidental move of `EraLI.tsx` and `ErasList.tsx`.

- **Test Plan**
  - Manual interaction checks:
    - Timeline opens with no pane by default.
    - Clicking era header opens `EraDetailPane` on right.
    - Clicking era-year row with no overrides opens `EraDetailPane`.
    - Clicking non-era year opens `YearFactsPane`.
    - Clicking era-year row with at least one override opens `YearFactsPane`.
    - Switching between pane types never shows both panes at once.
    - Unsaved changes in era pane trigger modal; "cancel" discards and proceeds to target pane.
    - Unsaved changes in year facts pane trigger year modal before switching.
    - Table width shrinks when either pane is open; expands when closed.
    - Narrative tab behavior unchanged.
  - Regression checks:
    - App compiles with moved files.
    - No broken imports in affected modules.
    - Existing era list components (`EraLI.tsx`, `ErasList.tsx`) unchanged.

- **Design Philosophy Check**
  - Consistent with philosophy:
    - Keeps components focused and reusable by moving shared pane components to `components/General`.
    - Uses explicit, centralized transition logic (clarity over cleverness).
    - Preserves separation of UI rendering and pane-routing logic.
  - Potentially inconsistent risks (to avoid during implementation):
    - Cramming pane routing and modal orchestration into one large page file.
    - Duplicating override-decision logic in multiple click handlers.
    - Introducing ad hoc style values instead of reusing semantic/layout primitives.

- **Acceptance Criteria**
  - Timeline supports both pane types via click rules above.
  - Pane open state on Timeline is not default-open and is local UI state only.
  - Unsaved-change handling matches clarified behavior.
  - Both panes open on the right and share consistent width behavior.
  - Target files are moved to `components/General` and all imports are updated without renames.




## **Bug Fixing & QA**
--------------------------------------------------

### **Bug 1: Only the first selection is working**
- IF I select one era from the timeline (Call it Era A), THEN it opens in the detail pane on the right (good)
  - THEN IF: I select a second Era (Era B), THEN: Nothing happens. Era A remains open 
  - (even if no changes have been made.)
- IF I select one era from the timeline (Call it Era A), THEN it opens in the detail pane on the right (good)
  - THEN IF I click the X on the EraDetailPane, It does NOT close. 
    - Expected behaviour: the pane should close when I click the X

Hypothesis and proposed fix:
- **Hypothesis**
  - The current Timeline implementation uses an indirect close handshake (`pendingPaneTarget` + `closeRequestVersion` + child `useEffect`) to switch away from an open `EraDetailPane`.
  - That handshake is brittle because close/navigation depends on async state timing across parent and child; if the close request and pending target get out of sync, the pane never transitions.
  - The same fragile path is also used when clicking the pane "X", which explains why both symptoms appear together:
    - selecting Era B after Era A does nothing, and
    - clicking X does not close.

- **Proposed Fix**
  - Remove the `closeRequestVersion`-driven close request flow.
  - Make pane transitions fully parent-owned and synchronous in `TimelinePage`:
    - Introduce a single `requestPaneTransition(target)` function.
    - If current pane has no unsaved changes, transition immediately.
    - If there are unsaved changes, open the unsaved modal and store `pendingPaneTarget`.
    - On modal action (`save` or `discard`), execute the transition directly from parent.
  - Keep `EraDetailPane` simple:
    - `onClose` should only mean "user requested close".
    - no parent-commanded close side effects in child `useEffect`.
  - Add explicit QA checks:
    - Era A -> Era B switches correctly (no edits).
    - Era A -> click X closes pane.
    - Same checks with unsaved edits and modal actions.