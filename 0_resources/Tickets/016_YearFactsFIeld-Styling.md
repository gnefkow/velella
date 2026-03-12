*STATUS: PAUSED - we paused this to update the Counterfoil docs so that Velvella team can know what a tiertiary button is*



# **YearFactsField Styling.** 
------------------------------------------------------------------------
In this ticket, we're restyling aspects of `YearFactsField.tsx`.

### **Two types of inputs:**
This component needs to support props for two types of inputs:
1. Money-formated inputs
2. Text Inputs

Money Inputs are formatted as money (USD) with commas and  no decimal points:
`$100`
`$123,456`
`$12,345,678`

Text inputs just support text. 

As of this ticket, ALL inputs will be "money" inputs (but we'll keep "text" ready for the future.)

### **Text inputs stay in the block (horizontally)**
Right now, the input fields are wider than the component that they are sitting in. These fields need to span 100% of the block—not more!

### **Change "subtitle" to Description**
Right now, we have a field called "subtitle" that we created in ticket [011](/0_resources/Tickets/011_UI-Year-Sidepane.md). We need to change this from `subtitle` to `description`

### **(?) Icons for descriptions.**
We need to use less pixels for the "description" fields of these. Let's remove them from the LI, and add a (?) icon that opens a pop-up with the description. 
- the (?) icon is a button-tertiary
- Clicking it opens a pop-up to the right side of the icon. That icon contains the description. 
- The pop-up is a component called "InfoBubble". The background is bg-primary, the border is border-tertiary, and it has a medium shadow.
- the InfoBubble is NOT a component that goes in the Timeline directory. 
  - Create a `General ` directory in sec/components/General , this is where the InfoBubble.tsx component goes
- Clicking off of the InfoBubble closes it

## **Implementation Questions**
------------------------------------------------------------------------
1. **InfoBubble path typo:** The ticket says "Create a `General` directory in sec/components/General". Should this be `src/components/General` (with InfoBubble.tsx inside it)?
*ANSWER: yes.*


### **InfoBubble positioning:** 
When the pop-up opens "to the right side of the icon," what should happen near the viewport edge—flip to the left, or allow overflow? Any preferred offset (e.g., 8px gap) between icon and bubble?
*ANSWER:*
- IT should display to the right side of the icon and always be completely in view. SO:
- IF: the InfoBubble is too near the top of the page, it locks to the top (so the top edge is 1em away from the top of the page)
- IF: the InfoBubble is too near the bottom of the page, it locks to the bottom (so the bottom edge is 1em away from the bottom of the page)

### **"Medium shadow":** 
Is there a semantic token for this in Counterfoil Kit (e.g., `shadow-md` or a custom token), or should we use a specific Tailwind class?
*check counterfoil again to see if something is available there. if not, check tailwind. 
Report back here: **Counterfoil:** No shadow tokens. semanticTokens.css defines backgrounds, text, borders, buttons, etc., but nothing for shadows. **Tailwind:** Use `shadow-md` — it's a built-in utility that applies a medium box-shadow (`0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`). Other options: `shadow-sm` (subtle), `shadow` (default), `shadow-lg`, `shadow-xl`, `shadow-2xl`.*
*ANSWER: use the tailwind `shadow-md`*

### **InfoBubble dismiss:** 
For "clicking off closes it"—should we also close on Escape key? Use a standard click-outside pattern?
*yes, ESC also closes it*


### **Input width overflow:** 
The inputs are "wider than the component." Is the overflow horizontal (inputs extending past the pane), or is there a min-width issue? The `EditableAmountCell` already has `w-full`. Should the YearFactsField block itself have `min-w-0` or `overflow-hidden` to contain flex children?
*Let me be more specific: the input FIELDS are wider than the component. It might be coded to say `w-full`, but that isn't what is happening, it is over-reaching.*

Hypothesis: **Flexbox `min-width: auto` on the input.** The input is a direct flex child of `Stack` (flex column). Flex items default to `min-width: auto`, which prevents them from shrinking below their intrinsic minimum. HTML `<input type="text">` elements have a browser-default minimum width (often ~10ch or more). So even with `w-full`, the input refuses to shrink below that minimum—it "pushes" the flex container wider, and the whole chain (Stack → YearFactsField → scroll container) grows to accommodate it, causing horizontal overflow past the pane's `w-[18em]` boundary. 

**Fix:** Add `min-w-0` to the input (or to a wrapper div around it) so the flex item can shrink below its intrinsic minimum and respect the parent's width constraint.


### **Money input display during edit:** 
When the user is actively typing in a money field, should they see (a) raw numbers only (current behavior), or (b) live-formatted display with $ and commas as they type? The ticket specifies display format ($100, $123,456) but doesn't say whether that applies during editing or only on blur.
*ANSWER: (b) live-formatted display with $ and commas as they type*

**Text input prop for future:** For "keep text ready for the future"—should we add an `inputType?: 'money' | 'text'` prop now (defaulting to `'money'`) that we wire up later, or just structure the component so it's easy to add without implementing text inputs in this ticket?
*Answer: add the inputType? prop.*

### **Icon for “(?)”**
Counterfoil exports Info (i in circle). Lucide’s HelpCircle (question mark) matches “(?)” better but isn’t exported by Counterfoil. Use Info or import HelpCircle from lucide-react?
*Use the Lucide HelpCircle*

### **InfoBubble size**
No max-width given. Should we cap it (e.g. max-w-xs or max-w-sm) for long descriptions?
*ANSWER: Yes, make the max 18ems*

### **Live money formatting**
Typing “1234567” should show “$1,234,567” as the user types. Need to decide:
Cursor behavior (e.g. keep cursor at end vs. try to preserve position)
Handling of invalid input (letters, multiple decimals)
Whether to allow typing $ or commas, or only digits
*ANSWER:*
- The number should right-align
- The cursor stays at the end (unless the user moves it with the arrow keys)
- It is not possible to enter invalid characters (typing them on the keyboard does nothing, it does not input them)
- "$" and "," are invalid characters. They cannot be typed. 
- Decimals "." also cannot be typed (users must put in whole numbers)


### **Gap between icon and InfoBubble**
No explicit offset. Use something like 8px (or gap-2) between the icon and the bubble?
*ANSWER*: Offset of 1 em. a little arrow points out of the Infobox at the (?) icon. 


-------------------------------------------------------------------------------------

## **IMPLENTATION PLAN**

### 0) Prep and naming cleanup
- Update ticket status from paused to active.
- Keep naming aligned with project conventions:
  - Rename `subtitle` prop/usage to `description`.
  - Keep component/file names in PascalCase.

### 1) Build `InfoBubble` as a reusable General component
- Create `src/components/General/InfoBubble.tsx`.
- Scope: small, focused component that renders:
  - `bg-bg-primary`
  - `border border-border-tertiary`
  - `shadow-md`
  - `max-w-[18em]`
- Add a small pointer/arrow aimed toward the trigger icon.
- Implement viewport-safe vertical positioning logic:
  - Default: open to the right of trigger.
  - Clamp to keep bubble fully in view.
  - Respect 1em viewport edge padding at top/bottom.
- Add dismissal behavior:
  - Click outside closes.
  - `Escape` closes.
- Keep this component generic (no Timeline-specific assumptions).

### 2) Add description-trigger UI to `YearFactsField`
- In `src/components/Timeline/YearFactsField.tsx`:
  - Change prop interface from `subtitle` to `description`.
  - Replace inline description row with compact trigger:
    - Use tertiary button styling.
    - Use Lucide `HelpCircle` icon.
  - Wire trigger to open/close `InfoBubble`.
  - Place bubble to the right with 1em offset.
- Keep title text visible in-row; move long explanatory copy to bubble.

### 3) Fix input overflow and preserve width constraints
- In `src/components/Timeline/EditableAmountCell.tsx`:
  - Add `min-w-0`.
  - Keep `w-full`.
  - Right-align numeric input (`text-right`).
- If needed, add `min-w-0` on immediate flex wrappers in `YearFactsField` to ensure flex children can shrink.
- Verify no horizontal overflow inside `YearFactsPane` (`w-[18em]` pane constraint).

### 4) Add future-ready input type contract
- Extend `YearFactsField` props with:
  - `inputType?: "money" | "text"` (default `"money"`).
- For this ticket:
  - Continue rendering all current editable fields as money.
  - Keep implementation structured so `"text"` can be added without rewiring component layout.

### 5) Implement live money formatting while editing
- In `EditableAmountCell`:
  - Store a digit-only internal value.
  - Render formatted display live as `$` + comma-separated whole number.
  - Reject invalid keystrokes (`$`, `,`, `.`, letters, symbols).
  - Keep cursor at end by default after accepted input changes.
  - Preserve existing Enter/Tab commit and Escape revert behaviors.
- Ensure committed value remains numeric and unchanged in downstream model shape.

### 6) Prop rename rollout
- Update all `YearFactsField` call sites (primarily `YearFactsPane`) from `subtitle` to `description`.
- Confirm TypeScript catches any remaining old prop usage.

### 7) QA and validation checklist
- Functional:
  - [ ] Info bubble opens from `(?)` trigger and closes on outside click.
  - [ ] `Escape` closes bubble.
  - [ ] Bubble stays fully visible near top/bottom viewport edges with 1em padding.
  - [ ] Bubble shows pointer toward trigger.
  - [ ] Inputs no longer overreach container width.
  - [ ] Money entry live-formats as `$123,456` while typing.
  - [ ] Invalid characters do nothing.
  - [ ] Numeric values still commit/update correctly.
- Visual:
  - [ ] Tertiary trigger looks consistent with Counterfoil button styling.
  - [ ] Bubble uses `bg-primary`, `border-tertiary`, `shadow-md`, max width 18em.
- Technical:
  - [ ] `npm run build` passes.
  - [ ] `npm run lint` (or targeted lint) passes for touched files.

### 8) Consistency with design philosophy
- **Consistent**
  - Create reusable `InfoBubble` in `General` (not Timeline-specific).
  - Keep components narrow in responsibility (`InfoBubble`, `YearFactsField`, `EditableAmountCell`).
  - Use semantic tokens/classes over raw hard-coded styles.
  - Keep API explicit (`description`, `inputType`).
- **Potentially Inconsistent (watchouts)**
  - Avoid letting `YearFactsField` become state-heavy with bubble + formatting logic; if complexity grows, split hooks/helpers.
  - Avoid ad-hoc absolute-position hacks; use clear positioning/clamping logic.