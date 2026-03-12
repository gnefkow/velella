# **CSS Spacing Fix**
------------------------------------------------------------
This ticket fixes the excessive spacing between text elements in the Year Facts panel (and similar list-style fields). The problem is that `<p>` elements have a 16px top and bottom margin from the browser default, which overrides our layout intent.

## **The Problem**
------------------------------------------------------------

### **Symptom**
- In `YearFactsField` (and anywhere the Counterfoil `Text` component is used), there is a large visual gap between the title and subtitle (e.g. "Dividend Income" and "Income from dividends.").
- The gap persists even after:
  - Reducing the Stack/Inline gap tokens (`--gap-xs`, `--gap-sm`, etc.) in `index.css`
  - Adding `leading-tight` to reduce line-height
  - Adding `m-0` to the `Text` component's `className`

### **Root Cause**
The 16px margin comes from the **browser's default user-agent stylesheet** for `<p>` elements:

```css
p {
  margin: 1em 0;
}
```

At 16px root font size, `1em` = 16px. The Counterfoil `Text` component renders a `<p>` tag, so every title and subtitle inherits this margin.

### **Why Our Overrides Failed**
1. **`m-0` is not in the built CSS** — The Tailwind utility class is never generated. Tailwind v4 with `@tailwindcss/vite` may use a different content-scanning strategy than the config's `content` paths, so classes used only in certain components (like `YearFactsField`) may not be scanned.
2. **Preflight's `* { margin: 0 }` may not apply** — Tailwind's preflight is in `@layer base`. The built output structure in Tailwind v4 may not include the preflight reset as expected, or layered styles may lose to the browser default in the cascade.

## **Proposed Solution**
------------------------------------------------------------

Add an explicit, unlayered reset in `velella/src/index.css` so we control paragraph margins:

```css
/* Reset paragraph margins so we control spacing via layout (Stack, gap tokens) */
p {
  margin: 0;
}
```

**Why this works:**
- Unlayered author styles override both layered styles and user-agent styles.
- The `p` selector is specific enough to target paragraph elements.
- Placing it in `index.css` keeps the fix in one place and gives Velella full control over text spacing.

**Result:** Spacing between title and subtitle (and all `Text` elements) will be determined solely by the Stack/Inline gap tokens (`--gap-xs`, `--gap-sm`, etc.) and line-height, not by the browser's default paragraph margin.

## **Implementation**
------------------------------------------------------------
1. Add the `p { margin: 0; }` rule to `velella/src/index.css` (after the `:root` block, before or after the `html, body` rules).
2. Remove the now-redundant `m-0` from `YearFactsField`'s `Text` components (optional cleanup).
3. Verify the Year Facts panel and other `Text` usages render with the intended spacing.
