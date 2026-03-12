# design_philosophy

This philosophy outlines the pattern preferences for how our code should work in this project. 



### **Application Design Philosophy**

This project follows a **modular, parsimonious design philosophy**. When generating or modifying code, follow these rules strictly:

#### 1. File and Module Structure

- **No large “god files.”**
  - A single file should rarely exceed ~150–200 lines.
  - If a file grows, extract logic into smaller modules immediately.
- Separate concerns clearly:
  - UI components
  - state / logic (hooks, services)
  - styling abstractions
  - configuration
- Prefer **many small, boring files** over a few clever ones.

#### 2. Components

- Components should be **simple, composable, and narrowly scoped**.
- Avoid monolithic “Main.tsx” or “App.tsx” files containing full app logic.
- Each component should:
  - do *one thing*
  - accept explicit props
  - delegate logic when possible
- Favor composition over condition-heavy components.

#### 3. Styling

- **Styling is abstracted and semantic.**
- Do NOT inline raw colors, spacing values, or typography.
- Use design tokens and utility classes derived from them.
- Components should read semantically (e.g. `text-primary`, not `text-blue-500`).
- If styling logic becomes complex, extract it.

#### 4. State and Logic

- Business logic does not live inside UI components unless trivial.
- Reusable or non-visual logic should be:
  - custom hooks
  - helper modules
  - services
- Avoid tightly coupling state to rendering.

#### 5. General Code Style

- Prefer clarity over cleverness.
- Prefer explicitness over inference.
- Avoid premature abstraction, but **do not hesitate to refactor** once patterns emerge.
- Optimize for long-term readability and change, not shortest code.

#### 6. Defaults for AI-generated Code

When generating code:

- Assume this is a **real application**, not a demo or tutorial.
- Start with a reasonable folder structure.
- Ask to split files if something becomes large.
- Never place the entire app in a single file unless explicitly instructed.



**Layout primitives**

We introduce layout primitives only to encode *rhythm and relationship*, not to replace CSS or enforce page structure. Layout components should remain simple, composable, and unsurprising.


**Naming**
*AI AGENT NOTE: As part of the process of checking and writing tickets, make sure that the plans conform to these guidelines. Mention it to the user in the chat if they forget.*
For components, we use **PascalCase** to name things (no spaces, underscores, or hyphens). 
For functions, or services, we use **camelCase**.
For data in the YAML, we use **kebab-case**
Examples: 
- component: `YearFactsPane`
- file: `YearFactsPane.tsx`
- function/service: `estimateTax`
- helper function: `buildYearFacts`
- prop type/interface: `YearFactsPaneProps`
- engine/module file: `calculateTimeline.ts`
- YAML data: `initial-portfolio`
