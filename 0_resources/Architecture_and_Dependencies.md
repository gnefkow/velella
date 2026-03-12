# Architecture and Dependencies

This document outlines the overall structure of the app and what it’s built with. Use it to see what’s in place so far. When we make large changes, consider updating it.

---

## Style Instructions. 
Look to the colors in Counterfoil Kit. 
By default, unless the user has requested otherwise, when creating new elements:
- make all text color: `text-primary`
- make background colors `bg-primary`
- make buttons with hierarchy: `tertiary`


## Calculation Engine

The timeline calculation lives in `src/engine/calculateTimeline.ts`. It is a pure function that takes a `Scenario` and returns a `Year[]` with computed `portfolioAmount` (real dollars). The engine uses the precise real-return formula: `(1 + marketReturn) / (1 + inflationRate)`.

## Design Principles

Data Storage:
  - Persistance vs Devived data:    In general, 
    - we PERSIST user-authored facts. (for example, the start date of scenarios, income/expenses in certain years or eras of scenarios, etc...)
    - We DERIVE calculated results (for example, portfolio balances in scenarios)
    - A good test is:
      - If the app forgot this value, could it recompute it exactly from the saved scenario?
      - If yes, it is probably derived and can live only in memory.
      - If no, it is probably a user input and should be persisted.


## Dependencies

### Application (runtime)

| Dependency                                   | What it is                                                                                                                                         |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **React**                                    | UI library. Components, state, and the tree we render.                                                                                             |
| **React DOM**                                | Renders React components to the browser DOM.                                                                                                       |
| **TanStack Table** (`@tanstack/react-table`) | Table engine for headless, flexible data tables (sorting, filtering, column defs, etc.). We use it for any tabular data and scenario/timeline UIs. |

### Counterfoil Kit (design system)

**Counterfoil Kit** is our design system and component kit. It is **not** an npm package; it lives as a **sibling directory** to this repo (`../../counterfoil-kit`).

- **What we use from it:** Primitive components (e.g. `Button`, `Stack`), semantic design tokens (colors, typography, spacing), and shared Tailwind config.
- **How it’s wired in:** Imports from `counterfoil-kit/src/...`, `index.css` imports the kit’s `semanticTokens.css`, `tailwind.config.cjs` spreads the kit config and includes the kit’s source in `content`, and Vite’s `server.fs.allow` includes the kit path so the dev server can serve it.

When working on UI, prefer kit primitives and semantic tokens over one-off styles.

### Build and tooling (dev)

| Tool             | Role                                                                                     |
| ---------------- | ---------------------------------------------------------------------------------------- |
| **Vite**         | Dev server, bundling, and production builds.                                             |
| **TypeScript**   | Static typing and better editor support.                                                 |
| **Tailwind CSS** | Utility-first styling; we extend it with the Counterfoil Kit config and semantic tokens. |
| **ESLint**       | Linting (including TypeScript and React).                                                |

The app uses **SWC** (via `@vitejs/plugin-react-swc`) for fast React/JSX compilation.
