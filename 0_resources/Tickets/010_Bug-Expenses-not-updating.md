Bug: **Expense is not updating.**
------------------------------------------------
What happens:
- User loads the interface. 
- Years 2026 - 2037 all show "expense" or 80,000 (from a previous session)
- User changes the value for the first one to 100000, presses "return" or "esc" or "tab" (at this point, the new value SHOULD save)
- User navigates to another tab (assumptions or narrative)
- THEN: the value resets to 80,000

NOTE: If instead of navigating to another tab, the user refreshes the browser, THEN the new value (100000) is saved. 

NOTE: the same behaviour is true on the "income" fields. 

NOTE: this happens whether there was a previous value (as in the scenario above) or if it was previously blank. Same behaviour: navigating to another tab and back resets the value to the previous value, but refreshing the page "saves" the value (from what it looks like on the front end). 

NOTE: the same behaviour is true if multiple fields are changed (navigating between the tabs resets the values, but refreshing "saves" the values)


### **Hypothesis and Rectification Plan**
------------------------------------------------

**Root cause:** The `persist` callback in `useScenario.ts` writes the updated scenario to YAML but does **not** update the in-memory `scenario` state. By contrast, `save` (used by AssumptionsPage) does both: `setScenario(updated)` and `saveScenario(updated)`.

**Flow that produces the bug:**
1. User edits expense/income on Timeline → `handleScenarioCommit` updates `localScenario` and calls `schedulePersist`.
2. After the 150ms debounce, `onPersist` (i.e. `persist`) runs → writes to YAML successfully.
3. `persist` never calls `setScenario(updated)`, so App's `scenario` (from `useScenario`) remains stale.
4. User navigates to another tab → `TimelinePage` unmounts (conditional render in `App.tsx`).
5. User navigates back to Timeline → `TimelinePage` mounts again with `scenario={scenario}` (the stale value from App).
6. `useEffect([scenario])` in `TimelinePage` runs → `setLocalScenario(scenario)` overwrites `localScenario` with the stale data.
7. The table re-renders with the old values.

**Why refresh works:** On full page reload, `useScenario`'s `refresh()` runs, which calls `loadScenario()` and reads from YAML. The YAML has the correct values (because `persist` wrote them), so the app loads the updated data.

**Rectification:** Update `persist` in `useScenario.ts` to also call `setScenario(updated)` after successfully saving to YAML, so the top-level scenario state stays in sync with what was persisted. This matches the behavior of `save` and ensures that when the user navigates away and back, the `scenario` prop passed to `TimelinePage` is up to date.