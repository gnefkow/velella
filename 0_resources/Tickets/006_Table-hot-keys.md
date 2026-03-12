
# Original Ticket

## **Keyboard Shortcuts on the table**
On the TimelineTabl.tsx, we add this interaction so it functions similar to Excel or other spreadsheet programs:

IF: the user has an input box selected on one of the rows, THEN:
- Clicks off of the cell (in any way) THEN: the value saves (to the yaml file)
What happens next depends on how the user deselect/saved the cell:
- Clicking off of the cell: just saves the value and no other cell is now in focus. 
- Hitting the **Return** key on the keyboard: saves the new input and changes focus to the input box on the same *column*, one *row* down. 
- Hitting the **tab** key on the keyboard: saves the new input and changes focus to the next input box on the same *row*. 
- Hitting the `ESC` key on the keyboard: is the same as clicking off - it saves the value and no other cell is now in focus. 


**TROUBLESHOOTING**
In trying to implement the above, we've run into an extremely difficult bug to resolve. What is happening:
- WHEN the user is on the Table, AND THEN the user clicks one of the inputs (expense or one of the income inputs), 
- THEN: the user is able to edit a number in the field, however, 
- WHEN the user tries to click away from the field (either by clicking out somewhere else on the page, hitting tab, or return), THEN the app freezes and crashes. 

Useful details, from testing, we know that:
- The new input DOES successfully save to the Yaml
- The freeze does not happen until the user tries to click out of the box (so it isNOT when the user clicks the input, NOR is it when the user types in the box. It ois only on the exit of the input box. )


---------------------------------------------------------------------------

### **Bug Fix 006.1**
*We tied to implement his fix, but it did not resolve the issue*
There is a focus bug in the current implementation. When the user presses `Return` or `Tab`, the next cell briefly appears to receive focus, but then the focus falls back to the non-editing wrapper state. The result is that the user sees a browser-style blue outline and must press `Return` again to begin editing. That is not the desired spreadsheet-like behavior.

What is likely happening:
- The app saves the updated scenario on `Return` / `Tab`.
- That save causes a React re-render.
- The current page structure in `App.tsx` appears to create inline component functions for pages. That can cause `TimelinePage` to unmount and remount on each save instead of updating in place.
- So the newly focused input is created, then immediately destroyed by the remount.
- After that, focus lands on the cell's non-editing `div`, which explains the blue outline and why the user must press `Return` again.

There is also a second likely issue:
- The editable cell currently commits on keyboard action (`Return` / `Tab`) and also commits again on `blur`.
- That means one navigation keystroke may trigger two commits and two save-related renders.
- That makes the focus handoff fragile and increases the chance that the next input loses editing state.

We should fix this in three parts:

1. Stabilize the page mount in `App.tsx`
- Do not create inline page components like `() => <TimelinePage ... />`.
- Instead, render the current page directly with conditional JSX.
- Goal: when `scenario` updates, `TimelinePage` should stay mounted and simply receive new props.

2. Prevent double-commit in `EditableAmountCell.tsx`
- Keep `Return` and `Tab` as explicit commit actions.
- But when one of those keys triggers a commit, the subsequent `blur` should not commit a second time.
- Use a ref/flag to suppress the `blur` commit when the blur is part of keyboard navigation.

3. Make focus handoff happen after the new render is ready
- The parent table should own the navigation target.
- When the user presses `Return` or `Tab`, store the intended next cell key.
- After the save/re-render completes, use an effect to focus that next cell and immediately place it into editing mode.
- The target state should be: if a cell is focused through keyboard navigation, the user can type into it immediately without pressing `Return` again.

Desired final behavior:
- `Return`: save current cell, move one row down in the same editable column, and open that next cell for immediate typing.
- `Tab`: save current cell, move to the next editable cell on the same row, and open it for immediate typing.
- `ESC`: discard the uncommitted edit and remove focus from the cell.
- In all keyboard-navigation cases, focus should land on the input itself, not the non-editing wrapper.


---------------------------------------------------------------------------


### **Bug Fix 006.2**
*STATUS: we tried this, it did not resolve the issue*
The error:
The current hot-key implementation appears to create a client-side focus / blur / remount loop. After the user presses `Return`, the app successfully saves the edited value to `scenario001.yaml`, but the browser then enters a rapid cycle where `EditableAmountCell` instances repeatedly unregister and re-register. That strongly suggests the problem is not TanStack itself and not the save request failing. Instead, it is likely caused by the interaction between:
- `onBlur` triggering a commit
- post-save rerendering of the table
- the `pendingFocus` effect trying to focus and re-open the next cell
- the newly focused input causing more blur/focus transitions

In short: the current implementation is too dependent on the save cycle and browser focus timing, and that creates a loop.

Proposed fix:
Replace the current save-aware focus choreography with a much simpler spreadsheet-style flow:
- Do **not** commit on `blur`
- Do **not** wait for save completion before moving focus
- Remove the `pendingFocus` / `requestAnimationFrame` / `expectedScenario` logic
- On `Return` or `Tab`, commit the current cell value locally, move focus immediately to the next editable cell, and open that next cell for typing right away
- Save the updated scenario in the background, without making focus behavior depend on the async save

This should make the interaction much more robust and should eliminate the blur/remount loop that is currently freezing the browser.

---------------------------------------------------------------------------


### **Bug Fix 006.3**
*STATUS: we tried this, it did not resolve the issue*
### Current understanding
The latest debugging suggests that the browser freeze is probably not caused by TanStack itself and not primarily caused by the input-cell focus logic. We now know:
- the YAML file is successfully updating when a user edits a cell
- the browser freezes immediately after that save
- console logs show the editable cell subtree being torn down after the save
- this still happens even after simplifying the cell interaction model

That points to a broader remount/reload problem after the YAML write, rather than a narrow `Enter` / `Tab` handling bug inside one cell.

The leading hypothesis is:
- `velella/data/scenario001.yaml` is being written inside the Vite project
- Vite is likely treating that file change as a watched project-file update
- that watcher-triggered invalidation/remount is causing the timeline table to unmount repeatedly, which freezes the browser

### Proposed fix
The next thing to try is to decouple runtime scenario data from Vite's source-file watching behavior.

Possible approaches:
- configure Vite so changes to `velella/data/scenario001.yaml` do **not** trigger HMR or full reload
- or move the persisted scenario YAML outside the Vite-watched app directory and keep reading/writing it through the `/api/scenario` middleware

Why this should still work:
- the app already knows about updates through `setScenario(updated)` in React state
- on full page load, the app already re-reads the YAML through `/api/scenario`
- so Vite does not need to watch the YAML file in order for the app to function correctly during editing
  

  ---------------------------------------------------------------------------

  ### **Bug Fix 006.4**
  *STATUS: we tried this, it did not resolve the issue*
### Current assessment
At this point, the strongest evidence suggests that the browser freeze is not fundamentally about TanStack, and not primarily about the `Return` / `Tab` key handlers themselves. The key observations are:

- The YAML file *does* update successfully.
- The browser freeze can happen even without pressing `Return` or `Tab`.
- A simple workflow like:
  - click into a cell
  - type a value
  - click anywhere else
  is enough to trigger the freeze.
- Console logs show this sequence:
  - cell gets focus
  - user types
  - `blur` fires when user clicks away
  - `blur` causes `commit()`
  - `commit()` causes `updateYearInput()`
  - `updateYearInput()` causes `onSave()`
  - after save begins, the timeline table rerenders
  - then the console floods with unregister/register messages from the editable cells

That means the immediate trigger is not "keyboard navigation"; the immediate trigger is "leaving the cell," because the current implementation treats `blur` as a full commit-and-save event.

In other words:
- clicking away currently means "save to YAML right now"
- `Return` currently means "save to YAML right now"
- `Tab` currently means "save to YAML right now"

That coupling is likely too aggressive for this UI. It creates a brittle chain where a normal focus change triggers persistence, rerendering, and whatever remount cycle is currently happening after the save.

### What I think the problem really is
The real architectural issue is that the implementation currently treats these two actions as if they are the same thing:

1. **Committing the cell value in the UI**
2. **Persisting the scenario to YAML on disk**

But they are not the same thing.

For a spreadsheet-like experience, what the user expects is:
- when they click away, the *cell value* is accepted
- when they hit `Return`, the *cell value* is accepted and focus moves down
- when they hit `Tab`, the *cell value* is accepted and focus moves right

From the user's perspective, that is "saved." But the file write to YAML should be treated as a separate background persistence step, not as part of the immediate focus interaction.

Right now, those two steps are fused together. So a harmless focus transition is immediately turned into a full scenario persistence operation.

### Proposed fix
The next implementation should separate **local commit** from **background persistence**.

The new model should work like this:

#### 1. Cell interactions commit locally first
Each editable cell should support a local draft value while the user is typing.

When the user does one of these actions:
- clicks away from the cell
- presses `Return`
- presses `Tab`

Then:
- parse the draft
- if the parsed value is different from the current committed value, commit it to the in-memory React scenario state immediately
- if the value did not actually change, do nothing

That means the table UI updates immediately and predictably, without waiting on file persistence.

#### 2. `blur`, `Return`, and `Tab` should all commit the value
This preserves the smooth Excel-like behavior:

- **Click away / blur**
  - commit the draft value locally
  - do **not** move focus anywhere
  - queue background persistence

- **Return**
  - commit the draft value locally
  - move focus to the same editable column in the next row
  - queue background persistence

- **Tab**
  - commit the draft value locally
  - move focus to the next editable cell on the same row
  - queue background persistence

- **ESC**
  - discard the draft
  - restore the last committed value
  - blur the field
  - do **not** persist anything

This gives the user the smooth interaction they expect while keeping the file persistence decoupled from the focus transition.

#### 3. YAML persistence should happen in the background
After local commit, the updated scenario should still be written to YAML. But that should happen as an asynchronous background effect, not as part of the immediate blur/focus contract.

Practically, that means:
- React state updates first
- UI is already correct
- persistence happens second

If persistence is slow, the UI should still feel responsive.

If persistence fails, we can surface an error state separately, but the basic table interaction should not freeze.

#### 4. No-op interactions should not save
This is important:
- clicking into a cell and clicking away without changing the value should not write the YAML
- `Return` or `Tab` on an unchanged value should not write the YAML

That avoids unnecessary persistence churn and reduces the chance of triggering any downstream watcher/remount behavior.

### Why this approach should help
This approach makes the UI behave more like a spreadsheet and less like a form submission.

It reduces the risk that:
- a `blur` event immediately kicks off heavy persistence work
- a focus change becomes tightly coupled to rerendering
- a harmless click-away causes the whole editable table subtree to churn

Most importantly, it matches the product requirement more naturally:
- the user wants a fast table-editing experience
- the YAML file is a persistence detail, not the thing that should control focus behavior

### Summary
My current assessment is:
- the freeze is most likely being triggered when a cell `blur`s and the app immediately persists to YAML
- that persistence then kicks off a rerender/remount cycle that floods the browser
- the solution is to separate "commit the cell in the UI" from "persist to disk"

The proposed behavior should be:
- click away: commit locally, persist in background
- `Return`: commit locally, move down, persist in background
- `Tab`: commit locally, move right, persist in background
- `ESC`: discard local draft and blur, with no persistence

---------------------------------------------------------------------------

### **Bug Fix 006.5 — Root Cause: Table Context Cascade + StrictMode Amplification**
*STATUS: RULED OUT — never attempted.*
*We tested the two preconditions before implementing:*
*1. Reduced `year-end` to 2 years (2 rows instead of 51) — freeze persisted with no improvement.*
*2. Removed `<StrictMode>` from `main.tsx` — freeze persisted with no improvement.*

*With only ~20 components in the tree and no StrictMode doubling, the cascade math collapses. Even a completely broken context cascade on 20 components should complete in microseconds. The freeze is not caused by scale or StrictMode amplification — it is caused by something that produces an unbounded loop, regardless of table size.*

#### Current hypothesis

Every major code change we have made — to blur behavior, save timing, local state, pending focus — has had no effect on the freeze. That strongly suggests the root cause is in something we have never touched.

After re-reading the design system, two untouched problems were found that compound each other:

**Problem 1: `Table` creates a new context object on every render**

In `counterfoil-kit/src/components/data/Table.tsx`, the context value is created as a plain object literal inside the render function:

```ts
const contextValue: TableContextValue = {
  stickyHeader,
  density,
}
```

React's context compares the value by reference (`===`). Every time `Table` renders, `contextValue` is a brand new object, which signals to all context consumers that the context has changed. All context consumers then rerender.

The consumers are `TableRow` and `TableCell`, which both call `useTableContext()`. With a 51-year scenario:
- 51 `TableRow` instances in the body
- ~408 `TableCell` instances
- 153 `EditableAmountCell` instances (inside cells)
- Total: **~617 component rerenders triggered by a single state update**

**Problem 2: React `StrictMode` doubles all of this in development**

`main.tsx` wraps the app in `<StrictMode>`. In development, StrictMode intentionally double-invokes render functions to detect side effects. So:

617 rerenders × 2 = **~1,234 component render calls per user interaction.**

StrictMode also runs effects, then cleanup, then effects again on every mount. This is why we saw the `register → unregister → register` flood for all 153 cells in the earlier logs — that was StrictMode's normal mount behavior, amplifying what would otherwise be a 1× cost into a 3× cost.

**Why this explains "same as before"**

Every fix we applied changed the timing, ordering, or existence of the blur/save/focus logic. But none of those changes touched the `Table` context or StrictMode. So the core rerender storm was completely unaffected by all our changes. Each user interaction — including a plain click-away with no value change — triggers ~1,234 component operations. If renders queue faster than they drain (e.g. rapid Tab presses or click-away after typing), the browser falls further behind until the tab appears completely frozen.

#### Proposed fix

Two changes, in priority order:

**Fix A — Stabilize the `Table` context value (counterfoil-kit)**

Memoize `contextValue` with `useMemo` inside `Table.tsx` so a new context object is only created when `stickyHeader` or `density` actually changes, not on every render:

```ts
import { useMemo } from "react"

// inside Table component:
const contextValue = useMemo(
  () => ({ stickyHeader, density }),
  [stickyHeader, density]
)
```

This stops the cascade of ~459 `TableRow`/`TableCell` rerenders on every state update. It is a one-line change to the design system.

**Fix B — Memoize `TimelineTable` with `React.memo`**

Even after Fix A, `TimelineTable` still rerenders any time its parent (`TimelinePage`) rerenders, even if `TimelineTable`'s actual props did not change. Wrapping it in `React.memo` makes React skip the rerender unless `scenario`, `years`, or `onSave` actually change:

```ts
export default React.memo(function TimelineTable({ scenario, years, onSave }: TimelineTableProps) {
  ...
})
```

**Quick tests before implementing (no code changes needed)**

1. Change `year-end` in `scenario001.yaml` to a value 5 years from now (5 rows instead of 51). If the freeze disappears or becomes much milder, scale is confirmed as the core driver.
2. Temporarily remove `<StrictMode>` wrapping in `main.tsx`. If the freeze reduces significantly, StrictMode is confirmed to be amplifying the cascade in development.

---------------------------------------------------------------------------

  ### **Bug Fix 006.6**
 *STATUS: We tried this experiment and the results were immediate: the counter immediatly and unstoppbly started counting. It went into many thousands in just a few seconds.*
 With only 2 rows and no StrictMode, even a completely broken context cascade would only affect ~20-30 components. Browsers can handle thousands of renders per second. If 20-30 rerenders are freezing the browser, the cause is not scale — it's an actual infinite loop.

Something is triggering state updates that trigger state updates that trigger state updates, endlessly. The table size is irrelevant if each interaction kicks off a cycle that never terminates.

The most likely suspects are the useEffect hooks. The classic React infinite loop pattern is:

Effect fires → updates state → rerender → effect fires again → ...
In this codebase, the chain to look at is in TimelinePage:

// This fires when `scenario` (from App) changes
useEffect(() => {
  setLocalScenario(scenario);  // <-- updates localScenario
}, [scenario]);
And localScenario drives years which drives TimelineTable which drives EditableAmountCell which has:

// This fires when `value` changes
useEffect(() => {
  setInputValue(formatAmount(value));  // <-- updates local state
}, [value]);
The question is: is something causing scenario (the top-level one from useScenario) to keep changing even when it shouldn't? Or is calculateTimeline producing values that feed back into a save?

The fastest way to diagnose this is to add console.count() to render functions — not long log messages, just counts:

// At the top of TimelinePage component body:
console.count("TimelinePage render")
// At the top of TimelineTable component body:
console.count("TimelineTable render")
Then click on an input and click away. If you see either counter going into the hundreds in the console, you've found which component is in the loop. That tells us exactly where to look next.

---------------------------------------------------------------------------

### **Bug Fix 006.7 — Unstable `columns` / `data` references feeding TanStack Table**
*STATUS: We have not yet attempted this fix*

#### Background

006.6 is correct that the freeze must be an infinite loop (2 rows + no StrictMode rules out scale). But the specific `useEffect` chains 006.6 identifies are unlikely to be the source, because `persist` (used by `TimelinePage`) does **not** call `setScenario`. The `scenario` prop from `App` should never change after a cell edit, so the `useEffect([scenario])` in `TimelinePage` should not fire repeatedly.

After reading every file in the render chain — `useScenario.ts`, `App.tsx`, `TimelinePage.tsx`, `TimelineTable.tsx`, `EditableAmountCell.tsx`, `calculateTimeline.ts`, `scenarioService.ts`, `vite.config.ts`, and `Table.tsx` in counterfoil-kit — the state update chain *appears* to terminate cleanly. But there is one major untouched problem that none of the previous fixes addressed.

#### The problem: `TimelineTable` passes new arrays to TanStack on every render

In `TimelineTable.tsx`, both `rows` and `columns` are plain local variables — not memoized:

```ts
const rows = buildRows(scenario, years);        // new array every render
const columns = [ ... ];                         // new array every render

const table = useReactTable({
  data: rows,
  columns,
  getCoreRowModel: getCoreRowModel(),
});
```

Every time `TimelineTable` renders, TanStack receives brand-new `data` and `columns` references. TanStack Table v8's `useReactTable` compares options by reference. When it detects "new" data or columns, it can trigger internal state resets (auto-reset of page index, sorting state, etc.), each of which fires an internal `setState` that causes React to re-render `TimelineTable`.

That re-render produces *another* new `rows` array and *another* new `columns` array, which TanStack again sees as "changed," which triggers another internal state update, which triggers another re-render — an infinite loop.

This is a [known TanStack Table v8 footgun](https://tanstack.com/table/latest/docs/guide/data). The docs explicitly warn that `data` and `columns` should have stable references (via `useMemo` or `useState`) to avoid unbounded re-render loops.

Additionally, `updateYearInput` (line 128) is a plain function that closes over the current `scenario` prop — it's not memoized. Every inline `onCommit` and `onFocusNext` lambda in the column definitions captures this unstable function, compounding the reference instability.

#### Why previous fixes had no effect

Every previous fix changed blur behavior, save timing, local state management, Vite HMR, or context cascading. None of them touched the `columns` or `data` references passed to `useReactTable`. So the core loop was completely unaffected by all prior changes.

#### Proposed fix

**1. Memoize `rows`**

```ts
const rows = useMemo(
  () => buildRows(scenario, years),
  [scenario, years]
);
```

This ensures TanStack only sees new data when `scenario` or `years` actually changes.

**2. Memoize `updateYearInput`**

```ts
const updateYearInput = useCallback(
  (year: number, updates: Partial<{ expenses: number; incomes: Record<string, number> }>) => {
    const nextScenario: Scenario = {
      ...scenario,
      years: scenario.years.map((yi) =>
        yi.year === year ? { ...yi, ...updates } : yi
      ),
    };
    onSave(nextScenario);
  },
  [scenario, onSave]
);
```

**3. Memoize `columns`**

Move the column definitions into a `useMemo` that depends on `incomeEarnerFirst`, `updateYearInput`, `registerCell`, and `focusNextCell`:

```ts
const columns = useMemo(
  () => [
    columnHelper.accessor("year", { ... }),
    columnHelper.accessor("portfolioAmountStart", { ... }),
    ...incomeEarnerFirst.flatMap((member) => { ... }),
    columnHelper.accessor((row) => row.yearInput.expenses, { ... }),
    columnHelper.accessor("portfolioAmountEnd", { ... }),
  ],
  [incomeEarnerFirst, updateYearInput, registerCell, focusNextCell]
);
```

This ensures TanStack only sees new columns when the actual column structure or callbacks change, not on every render.

#### Diagnostic step (before implementing)

Use the `console.count()` approach from 006.6, but expand to four components:

```ts
// At the top of AppContent body:
console.count("AppContent render")
// At the top of TimelinePage body:
console.count("TimelinePage render")
// At the top of TimelineTable body:
console.count("TimelineTable render")
// At the top of EditableAmountCell body:
console.count("EditableAmountCell render")
```

Click a cell, type a value, click away. If `TimelineTable render` runs into the hundreds while `TimelinePage render` stays low, the loop is between TanStack and the unstable references — confirming this hypothesis. If `TimelinePage render` also runs into the hundreds, the loop is higher up and 006.6's hypothesis should be revisited.




---------------------------------------------------------------------------

### **Bug Fix 006.8**
*UPDATE: Fix 6.7 was a partia success. Now:*
*-  De-selecting the input functions*
*-  de-selecting an input no longer freezes the app.*
*-  Adding an input for Expenses or income still saves to the yaml*
*However, there is still a bug: Keyboard shortcuts are not working*
 *- ESC DOES deselect the call (this is correct)*
 *- Return does NOT shift focus to the cell in the same column on the row below (as it should)*
 *- Tab does NOT shift the focus to the next cell in the row*
 *STATUS: This was implemented. It was a partial success, now "Tab" works, but "Return" still doesn't work*.

#### Hypothesis

There are two issues: one is the direct cause of the broken keyboard navigation, and the other is a secondary bug left over from 006.7 that undermines the memoization we added.

**Issue 1 (primary): `queueMicrotask` fires after React's re-render destroys focus**

When the user presses Enter, the flow is:

1. `handleKeyDown` → `commit("down")`
2. Inside `commit`: `onCommit(n)` → `updateYearInput` → `onSave(nextScenario)` → `setLocalScenario(updated)` (batched)
3. `queueMicrotask(() => onFocusNext?.("down"))` is scheduled
4. `handleKeyDown` returns
5. React flushes the batched state update — full re-render of `TimelinePage` → `TimelineTable` → all cells
6. **Then** the microtask fires and tries to focus the next cell

The problem is step 5–6. React 18 with `createRoot` flushes discrete event state updates (like keydown) synchronously at the end of the event handler — *before* microtasks run. So between committing the value and the focus call, a full re-render happens. During that re-render, `columns` recomputes (see Issue 2 below), TanStack processes new column definitions, and all cell render functions re-execute. Even though React reconciles the DOM elements (preserving the same `<input>` nodes), the re-render can interfere with the focus call by changing internal React state, updating controlled input values, or firing effects that conflict with the programmatic focus.

The fix is to call `onFocusNext` **synchronously** inside `commit`, before React flushes anything. At that point, the DOM is unchanged, the cell handles in `cellRefs` are all valid, and `focus()` simply works. The subsequent React flush will re-render the table, but React preserves focus on DOM elements that are already focused.

The call sequence with the fix:

1. `handleKeyDown` → `suppressBlurCommitRef.current = true` → `commit("down")`
2. Inside `commit`: `onCommit(n)` batches a state update
3. `onFocusNext?.("down")` → `focusNextCell` → `focusAndEdit()` → `focus()` on next input
4. Browser fires `blur` on old input → `handleBlur` sees `suppressBlurCommitRef = true` → skips commit
5. Browser fires `focus` on new input → `onFocus` → `select()`
6. `commit` returns → `handleKeyDown` returns
7. React flushes batched update → re-render preserves focus on the already-focused input

This matches the ESC behavior pattern (ESC calls `revert()` which calls `blur()` synchronously — and it works). The difference is that Enter/Tab use `queueMicrotask`, which introduces a gap where React's re-render can interfere.

**Issue 2 (secondary): `editableColumnIds` is not memoized, so `columns` recomputes every render**

In the 006.7 fix, we memoized `columns` with deps `[incomeEarnerFirst, updateYearInput, registerCell, focusNextCell]`. But `editableColumnIds` was left as a plain variable:

```ts
const editableColumnIds = [
  ...incomeEarnerFirst
    .filter((m) => m.incomeEarner)
    .map((m) => `${m.id}-income`),
  "expenses",
];
```

This creates a new array reference every render. Since `getNextCellKey` depends on `editableColumnIds`, and `focusNextCell` depends on `getNextCellKey`, the chain breaks:

- `editableColumnIds` → new reference every render
- `getNextCellKey` → recreated every render
- `focusNextCell` → recreated every render
- `columns` → recreated every render (because `focusNextCell` is in its deps)

This means the `useMemo` on `columns` is effectively a no-op — it recomputes every render because one of its dependencies is always new. This doesn't cause the infinite loop (that was fixed by memoizing `rows`), but it does cause unnecessary re-renders of every cell on every parent render, and it means the focus functions captured in closures are always stale by one render.

The fix is to memoize `editableColumnIds`:

```ts
const editableColumnIds = useMemo(
  () => [
    ...incomeEarnerFirst
      .filter((m) => m.incomeEarner)
      .map((m) => `${m.id}-income`),
    "expenses",
  ],
  [incomeEarnerFirst]
);
```

This stabilizes the entire `getNextCellKey` → `focusNextCell` → `columns` chain, making the 006.7 memoization actually effective.

#### Proposed changes

**In `EditableAmountCell.tsx`:** Replace `queueMicrotask(() => onFocusNext?.(direction))` with a direct synchronous call `onFocusNext?.(direction)`.

**In `TimelineTable.tsx`:** Memoize `editableColumnIds` with `useMemo`.



---------------------------------------------------------------------------

### **Bug Fix 006.9**
*UPDATE: Fix 6.8 was a partia success. The "tab" button now works, however, the "return" button is not acting as expected. "Return" should move focus to the same column on the row below. However, currently, hitting return does nothing.*

*STATUS: This finally fixed all of the issues in this ticket*

#### Hypothesis

Tab and Enter go through the same code path: `handleKeyDown` → `commit(direction)` → `onFocusNext?.(direction)` → `focusNextCell` → `getNextCellKey` → `cellRefs.current.get(key)?.focusAndEdit()` → `focus()`. The only difference is the direction (`"right"` vs `"down"`), which changes the target cell key. There is no code branching that treats Enter and Tab differently beyond the direction argument.

After examining every file in the chain — including the counterfoil-kit `Table`, `TableRow`, and `TableCell` components — there is no parent component intercepting the Enter key, and no DOM-level interference.

The most likely cause is that **focus IS being moved to the target cell, but the subsequent React re-render displaces it**. Here's why:

When `commit("down")` runs, it calls `onCommit(n)` which calls `updateYearInput` → `onSave(nextScenario)` → `setLocalScenario(updated)`. React batches this. Then `onFocusNext?.("down")` moves focus synchronously. Then `commit` returns and the event handler finishes. Then React flushes the batched state update.

During that flush, `scenario` has changed. Because `updateYearInput` is memoized with `[scenario, onSave]` as dependencies, it gets a new identity. Because `columns` depends on `updateYearInput`, the entire `columns` array is recomputed. TanStack Table receives brand-new `data` AND brand-new `columns` in the same render. When both inputs change simultaneously, TanStack rebuilds its internal column model and row model from scratch. This internal rebuild can reset focus-related state or trigger internal `setState` calls that queue additional renders — and those subsequent renders can displace the programmatic focus that was just established.

**Why Tab works but Enter doesn't:** Both trigger the same re-render cascade, but Tab's target cell is in the **same row** as the source cell. When TanStack rebuilds its row model, it processes each row sequentially. The source row (which contains both the source and target cells for Tab) is processed in a single pass. The browser's focus state on an element within that row survives the reconciliation. For Enter, the target cell is in a **different row**. The source row and target row are processed as separate table rows. Between processing the source row (where focus was) and the target row (where focus should be), TanStack's internal state changes can cause React to lose track of which element should have focus.

**The fix:** Make `updateYearInput` independent of `scenario` by reading the current scenario from a ref instead of closing over it. This way `updateYearInput` is stable (depends only on `onSave`), which means `columns` is stable across commits, which means TanStack only sees `data` change — not `columns`. When only `data` changes, TanStack reuses the existing column model and simply re-renders cells with new values, which is a much lighter operation that preserves focus.

#### Proposed changes

**In `TimelineTable.tsx`:**

Add a `scenarioRef` that tracks the current scenario, and update `updateYearInput` to read from it:

```ts
const scenarioRef = useRef(scenario);
scenarioRef.current = scenario;

const updateYearInput = useCallback(
  (
    year: number,
    updates: Partial<{ expenses: number; incomes: Record<string, number> }>
  ) => {
    const current = scenarioRef.current;
    const nextScenario: Scenario = {
      ...current,
      years: current.years.map((yi) =>
        yi.year === year ? { ...yi, ...updates } : yi
      ),
    };
    onSave(nextScenario);
  },
  [onSave]
);
```

This makes `updateYearInput` stable: it only depends on `onSave` (which is itself a stable `useCallback` from `TimelinePage`). As a result, `columns` only recomputes when the column structure or navigation functions actually change — not on every cell edit.

#### Diagnostic step (if the fix alone doesn't resolve it)

Add these console logs to trace the exact focus chain:

```ts
// In focusNextCell, before the focus call:
console.log("focusNextCell:", { rowIndex, columnId, direction, nextCellKey, handleExists: cellRefs.current.has(nextCellKey) });

// In EditableAmountCell's focusAndEdit:
console.log("focusAndEdit:", cellKey, "inputRef exists:", !!inputRef.current);
```

Click a cell, type a value, press Enter. Check the console:
- If `focusNextCell` logs with `handleExists: false` → the cell key lookup is failing (key mismatch between registration and lookup).
- If `focusNextCell` logs with `handleExists: true` and `focusAndEdit` logs with `inputRef exists: true` → focus IS being called; the issue is that the re-render displaces it afterward (confirms the hypothesis above).
- If `focusNextCell` doesn't log at all → the `onFocusNext` callback or `commit` is not reaching `focusNextCell` (stale closure issue).