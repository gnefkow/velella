# **Add Eras to Timeline Page**
--------------------------------------------------------------------------------
Look at [this wireframe](/0_resources/Tickets/z_Assets/Narrative-Wireframe-02.png)
This is the TimelinePage.tsx, but I've sketched in what it looks like for `eras` to be overlayed on the table. 

Note that in this image:
- 2026-2031 is in an "era"
- 2032 - 2033 is NOT in an "era"
- 2034 - 2039 is in an "era"
- 2040 - 2045 is NOT in an "era"
- 2046 - 2051 is in an "era"

So we can see that the year rows on the TimelineTable are now grouped. 
There are two kinds of groups:
- **Era Groups:** which visually groups the years in an era together. (A different group for each era)
- **Non-Era Groups** which visually groups together years that are in a range that are not in an era. 

This is only a visual grouping, there is no interactivity or ability to edit `era`s through this interface. 

Visually:
- Era Groups have a background of "accent"
  - In the horizontal row that is above the group
  - as a .5 em border on the left of the year rows in the group. 
- Non-era Groups us the "border-tertiary" color on:
  - The .5em horizontal border on the top of that group
  - the .5em border on the left of the group. 
- There is a .5 em margin between each group. 


## **Clarifications**
--------------------------------------------------------------------------------
**Q:** **Era name in header row:** The wireframe shows "Era-1_Name (Years 2026-2033)" in the row above each era group. Should this ticket include displaying the era nickname and year range in that header row, or is it purely a visual accent bar with no text?
*A: Yes, it should display the range and the nickname in the header.*

**Q:** **Non-era group header:** For Non-Era Groups, is there a visible row above the group (like a thin separator bar), or just a border line between the previous group and the first year row?
*A: Above the Non-Era Groups, there should be a border line. Between ALL groups, there should be a margin. (The margin will look like a white line, but it is actually the bg-background from the page).*

**Q:** **Dependency on 019:** Is this ticket blocked by 019 (Eras V0) being complete? The implementation assumes `scenario.eras` exists and years can be grouped.
*A: 019 is complete. Please review the code to see how that was structured since we'll be relying on the logic that was created in that ticket.*

**Q:** **Accent token:** For the era group background, which Counterfoil token should we use—`bg-accent`, `bg-accent-primary`, or another?
*A: bg-accent*

**Q:** **All-years edge case:** If there are no eras at all, should we render one large Non-Era Group with the border-tertiary styling, or no grouping at all?
*If there are no eras, just make it one large group*


## **Implementation Plan**
--------------------------------------------------------------------------------
### 1. Add a pure helper that turns years + eras into timeline groups
- Reuse the existing `scenario.eras` data and `sortErasByStartYear` helper from 019 instead of introducing a second grouping model.
- Add a small helper module that takes:
  - the rendered timeline years
  - the scenario's `eras`
  - the overall visible year range
- That helper should return a flat ordered list of groups, where each group is either:
  - an `era` group
  - a `non-era` group
- The helper should fill the gaps between eras with `non-era` groups, so a sequence like `era / gap / era / gap / era` becomes a renderable list.
- If there are no eras, it should return one large `non-era` group covering the full timeline range.

### 2. Keep the grouping logic out of `eraService`
- This ticket is visual only. It should not add any new `era` mutation behavior.
- The existing `eraService.ts` and `YearInput.eraMetadata` logic from 019 should remain the source of truth for which years belong to an era.
- The new helper should read from that existing shape, not duplicate or reinterpret the persistence logic.

### 3. Refactor `TimelineTable` so grouped rendering is manageable
- `TimelineTable.tsx` is already fairly large, so this ticket should avoid layering more conditional rendering directly into that file.
- Extract small timeline-specific pieces such as:
  - a helper for building grouped timeline rows
  - a presentational row for the group header / separator line
  - a presentational wrapper for grouped year rows if needed
- Keep TanStack responsible for columns and per-year cell rendering, but keep the era-group display logic in small helpers/components around the row rendering.

### 4. Render a header row for each group
- Before the year rows in each group, render a full-width group row.
- For `era` groups:
  - the row background is `bg-accent`
  - it displays the year range and the era nickname
  - example structure: "`2026-2031` `Era Name`"
- For `non-era` groups:
  - render a top border using `border-tertiary`
  - do not render era text
- Between every group, render a `.5em` vertical gap so the page background shows through between sections.

### 5. Add the left-side visual border to each year row in a group
- Each year row should visually belong to its group, not just sit under the group header.
- For `era` groups, add a `.5em` left border in the accent color on each year row in that group.
- For `non-era` groups, add a `.5em` left border in `border-tertiary`.
- This styling should be applied at the row wrapper level so it affects the full row consistently, not cell-by-cell in an ad hoc way.

### 6. Preserve current Timeline behavior
- Keep the current editable table behavior intact:
  - row selection
  - editable wages cells
  - C-POP styling
  - horizontal scrolling
- Group rendering should be a visual layer around the existing year rows, not a rewrite of the timeline table's editing behavior.
- The selected year should still be visually selected within its grouped row.

### 7. Define a clear mapping between rendered rows and group membership
- Build groups from the same year values that `TimelineTable` already renders so there is no mismatch between:
  - calculated `years`
  - `YearInput` rows
  - displayed group boundaries
- Prefer grouping by the rendered `row.year` values rather than by assumptions alone, so the grouping and the visible rows always stay in sync.
- The helper should make it easy to answer:
  - which group a year belongs to
  - whether a row is the first/last row in a group
  - what label/border treatment the group gets

### 8. Keep styles semantic and Counterfoil-friendly
- Use semantic classes/tokens only:
  - `bg-accent` for era headers and era left borders
  - `border-border-tertiary` for non-era separators and left borders
  - page/background tokens for the gap between groups
- Do not introduce hard-coded color values.
- Keep any styling utilities small and named by meaning, not by raw color or pixel value.

### 9. Add focused tests for grouping behavior
- Add unit tests for the new grouping helper to cover:
  - no eras => one large non-era group
  - alternating era and non-era ranges
  - eras at the beginning or end of the timeline
  - adjacent eras with no non-era gap
- Add a component-level test for `TimelineTable` that verifies:
  - era header text renders
  - non-era separators render
  - grouped year rows still render the expected year data

### 10. Design philosophy check
- **Consistent with the design philosophy**
  - Use a small pure helper for grouping instead of burying year-range math inside the JSX.
  - Reuse the existing `era` model from 019 rather than creating a second source of truth.
  - Keep styling semantic with Counterfoil tokens like `bg-accent` and `border-tertiary`.
  - Break the feature into small timeline-specific helpers/components instead of making `TimelineTable.tsx` even more monolithic.
- **Inconsistent with the design philosophy**
  - If we implement grouping by adding a large block of inline conditionals directly inside `TimelineTable.tsx`, we will make an already-large file harder to reason about.
  - If we infer era membership from visual table position instead of the existing `scenario.eras` data, we risk creating fragile UI behavior that drifts from the persisted model.