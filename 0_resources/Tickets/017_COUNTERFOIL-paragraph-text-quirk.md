
Dearest Counterfoil Team,

We wanted to flag a quirk we ran into while building Velella on top of Counterfoil. We are using Counterfoil the way we expect many app teams will: relying on its primitives, spacing tokens, and semantic typography styles to move quickly through feature work without hand-styling every UI surface. In that context, we found a behavior in the `Text` primitive that was surprising enough to cost us debugging time, and we think it could easily surprise other teams as well.


## **The Context**
We discovered this while building a compact "Year Facts" panel that stacked a title and subtitle vertically using Counterfoil layout primitives. The component looked straightforward: use `Stack` to control vertical spacing, use `Text` for the title and description, and then tune the spacing with gap tokens and line-height. When the visual gap between the two text elements was much larger than expected, our first assumption was that our `Stack` gap, local classes, or token values were off.

That assumption turned out to be wrong. The spacing bug was coming from the browser's default paragraph margins, which were still being applied through Counterfoil's `Text` primitive. Because the component presents itself as a general-purpose text primitive rather than as a lightly styled paragraph wrapper, the source of the spacing was not obvious during implementation.


## **The issue:**
The core issue is that `Text` currently renders a raw `<p>` element, so browser-default paragraph behavior is still active. In practice, that means app teams can believe they are controlling spacing through Counterfoil layout primitives while an unseen user-agent margin is also participating in layout. This is especially confusing because the `Text` API exposes typography concepts like `h1`, `h2`, `body1`, and `body2`, which makes it feel like a general typography primitive rather than a paragraph-specific component.

From an app team's perspective, this creates two problems. First, the behavior is surprising: a developer can reduce gaps, tweak line-height, and add utility classes without realizing the real source of the space is the native `<p>` margin. Second, the burden of solving the problem falls to each application individually, even though the issue originates in a shared primitive. For a library used across multiple apps, that means the same debugging cycle is likely to repeat unless the behavior is made explicit or corrected centrally.



## **Proposed Solution**
We think the right long-term answer is a library-level fix, not just a docs note. A short note in a "gotchas" section would still be useful as immediate protection for teams, but it would only document the surprise rather than remove it.

A library-level fix would mean that Counterfoil's `Text` primitive fully owns the layout behavior of the element it renders, instead of inheriting browser-default paragraph spacing. In practical terms, that likely means one of the following:

- Reset paragraph margins inside the `Text` component or within Counterfoil's base styles so that `Text` has predictable spacing wherever it is used.
- Make the underlying rendered element explicit and flexible, so teams can choose whether they want a paragraph, span, or heading semantics without getting unintended paragraph margins.
- Align the public API and documentation with the rendered HTML semantics, so a component that looks like a typography primitive does not quietly behave like a browser-default paragraph.

Our preference would be for Counterfoil to ensure that `Text` participates in layout predictably by default, with spacing controlled by Counterfoil layout primitives and app-level composition rather than user-agent margins. That would make the primitive safer for downstream teams and would prevent each app from having to discover and patch the same quirk on its own.



-------------------------------------------------------------------------------------

## **Counterfoil Response & Our Action Items**

The Counterfoil team shipped version **1.0.1** with a proper fix. Here's what changed and what we need to do.

### What Counterfoil Fixed

1. **Added `as` prop** — Override the rendered HTML element (`h1`–`h6`, `p`, `span`, `label`, `div`)
2. **Semantic defaults by size** — Heading sizes (`h1`–`h6`) now render as their corresponding heading elements. Body sizes (`body1`, `body2`) render as `<span>`.
3. **Unconditional margin reset** — All `Text` elements now have `m-0` applied internally. Spacing is controlled entirely by `Stack`/`Inline` gaps.

This is exactly what we asked for: `Text` now fully owns its layout behavior.

---

### What Velella Needs to Do

#### 1. Update the package
```bash
npm update counterfoil-starter-kit
```
Verify we're on **1.0.1** or later.

#### 2. Remove our workaround in `index.css`
In [Ticket 015](015_CSS-Spacing-Fix.md), we added `p { margin: 0; }` as a workaround. This is now redundant and should be removed:

```css
/* DELETE this block from velella/src/index.css */
p {
  margin: 0;
}
```

#### 3. Audit `Text` usages for semantic correctness
The new defaults are:
- `size="h1"` → renders `<h1>`
- `size="h2"` → renders `<h2>`
- ...
- `size="body1"` → renders `<span>`
- `size="body2"` → renders `<span>`

For most cases this is correct. However:
- If we need a `<p>` for paragraph semantics (e.g., long-form text blocks), use `as="p"`
- If we need a `<label>` for form fields, use `as="label"`

#### 4. Review `YearFactsField` and similar components
These were the original pain points. After the update:
- Remove any `m-0` classes we added to `Text` components (Counterfoil handles this now)
- Confirm spacing is correct with just `Stack` gap tokens

---

### Consistency with Design Philosophy

**Consistent:**
- We flagged a library-level issue to Counterfoil rather than permanently patching around it
- The fix came from the shared toolkit, so all teams benefit
- We can now remove our local workaround, reducing Velella-specific CSS

**Inconsistent:**
- None — this is the clean resolution we hoped for

---

### Migration Checklist

- [x] Run `npm update counterfoil-starter-kit` and verify version ≥ 1.0.1 — *Velella uses local counterfoil-kit path; kit is at 1.0.1 with fix*
- [x] Remove `p { margin: 0; }` from `velella/src/index.css`
- [x] Remove any `m-0` classes manually added to `Text` components — *None present in source*
- [x] Spot-check `YearFactsField`, `YearFactsPane`, and other text-heavy components for correct spacing
- [x] If any text blocks need paragraph semantics, add `as="p"` explicitly — *Audit complete; current usages (labels, headings, short prompts) use correct defaults*
