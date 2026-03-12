# Overview
In this ticket, we're standing up the overarching front end architecture for the app that we're building. 
We are NOT working with any data or data modeling in this ticket yet, just UI. 

## UI Architecture. 
Our application is made of react components. 
On top, we have the `Global_Nav` component. The Global nav is a top-bar with: 
- The `scenario-title` on the left
- three tabs (using the medium "tab" component from Counterfoil) that navigate between three pages:
  - Narrative
  - Timeline
  - Assumptions

Three pages
Each page is a react component and a directory. 
- `Narrative` is a directory within the `Components` directory. Inside it is `NarrativePage.tsx`, which is the component that displays when the "Narrative" tab is selected in the `Global_Nav`. 
  - Is displays paragraph text that says: "Coming Soon"
- `Timeline` is a directory within the `Components` directory. Inside it is `TimelinePage.tsx`, which is the component that displays when the "Timeline" tab is selected in the `Global_Nav`. 
  - Is displays paragraph text that says: "Coming Soon"
- `Assumptions` is a directory within the `Components` directory. Inside it is `AssumptionsPage.tsx`, which is the component that displays when the "Assumptions" tab is selected in the `Global_Nav`. 
  - Is displays paragraph text that says: "Coming Soon"


# Questions:
- Do we need a library for displaying and doing math on dates?





## Implementation plan

### Goal

Implement the overarching UI shell: **Global_Nav** (scenario title + three tabs) and three **page components** (Narrative, Timeline, Assumptions) that show "Coming Soon". No data modeling or date libraries; UI only.

### Constraints (from design_philosophy.md)

- Small, focused files; no god files (~150–200 line cap).
- App.tsx stays thin: compose layout and delegate.
- Semantic styling only (tokens / Counterfoil); no raw colors or spacing.
- One concern per file; composition over condition-heavy components.

### Current state

- `velella/src/App.tsx`: single "Hello World" view using Counterfoil `Button` and `Stack`.
- No `components` folder yet; no routing library.

### Architecture

- **Tab switching:** Use React state (e.g. `activeTab: 'narrative' | 'timeline' | 'assumptions'`) in `App` or a small layout component. No router in this ticket.
- **Scenario title:** Placeholder text (e.g. "Scenario") on the left of the nav; can be replaced with props/context later.

### Implementation steps

**1. Folder structure** — Under `velella/src/`:

- `components/Global_Nav/` — directory for the top bar.
- `components/Narrative/NarrativePage.tsx`
- `components/Timeline/TimelinePage.tsx`
- `components/Assumptions/AssumptionsPage.tsx`

Optional: `components/Global_Nav/GlobalNav.tsx` (or `Global_Nav.tsx`). Keep each file under the line limit.

**2. Global_Nav component**

- **Left:** Scenario title (placeholder for now, e.g. "Scenario" or "My Scenario").
- **Right (or center):** Three tabs using **Counterfoil's medium "tab" component** (Narrative, Timeline, Assumptions).
- **Props:** Accept `activeTab` and `onTabChange` so the parent controls which tab is selected and which page is shown.
- **Styling:** Semantic tokens only; top bar spans full width. Confirm the exact Tab import from the Counterfoil kit.

**3. Page components**

- **NarrativePage.tsx**, **TimelinePage.tsx**, **AssumptionsPage.tsx:** Each renders a single paragraph: "Coming Soon". Use semantic text/layout classes.

**4. App composition**

- **App.tsx:** Hold `activeTab` state. Render `Global_Nav` with `activeTab` and `onTabChange`, and a main content area that conditionally renders the three page components based on `activeTab`. Keep App thin; extract `AppLayout` if needed.

**5. Optional:** Index files that re-export page components for cleaner imports, if the project uses path aliases.

### Out of scope for this ticket

- Data layer, API, or scenario model.
- URL-based routing (no React Router).
- Date library (question left open).
- Real scenario title source (placeholder is enough).

### Verification

- Global_Nav shows scenario title + three tabs; clicking tabs switches the main content.
- Each of the three pages shows "Coming Soon" when selected.
- No new runtime dependencies beyond existing (React, Counterfoil).
- File structure and small-file discipline match the design philosophy.

