# **Introducing Eras**
-------------------------------------------------------
[This is a rough wireframe](/0_resources/Tickets/z_Assets/Narrative-Wireframe-01.png)

It is incomplete, just a sketch to start to think about where some things can go. 

We can imagine that this is on the **NarrativePage** and that it is a representation and editor for the user's **Eras**. 

It is a horizontal timeline with several elements stacked on top. 
Let's start with the **Year Row**. This is the core of the timeline. We can see in this example that it starts with '26, which is short for 2026. The years fade off, but we can imagine that spans the whole range of years that the user has put into **Assumptions**. 

On the **Year Row**, we can see that there are some blue boxes with rounded corners. These show the `era`s that the user has created. They have created three eras: "Dallas", "Sailing Around the World", and "Philadelphia". These titles are the nickname for each of the era. We can see the range both indicated by the blue boxes on the **Year Row** and the range of years as a little "eyebrow" above the era nickname. 

Above all of this, we can see some boxes that say "All" "Range" and "+" an "-". We don't need to worry about the specifics of these too much, other than to say that the user can zoom in and out on this timeline to change the "view" of the number of years that they are seeing. THe maximum number of years that they can see is the number that they've specified in **assumptions**.

Under the **Year Row**, we can see some **Age Rows** that show the ages of people in the household for that year. In the wireframe, they cut off (and then numbers are all the same), but imagine that they run the length of the timeline. 

Underneadh the **Age Rows** we can see a graph. This is the **C-POP** graph, and it is showing us a subtle visual of the user's C-POP numbers each year. 

**Hover** We can imagine that as the user hovers over various parts of this timeline, it shows them some information. For example, the exact C-POP number on the graph. 

**Click into an Era** We can imagine that when the user clicks on one of those blue boxes on the **Year Row**, that an info panel pops open where they can view and adust aspects of that era. 

**Less on zoom out** We can imagine that as the user zooms out, they see less details on the screen. This manages both UX (text isn't tiny) and the number of DOM elements we need to control for. 



## **Technology Notes**
-----------------------------------------------------------------

### Layers in the Wireframe
The NarrativePage timeline is not one monolithic widget. It is several coordinated layers that share a single horizontal axis (years) and must stay in sync as the user zooms:

1. **Zoom controls** — standard UI buttons (All, Range, +, -)
2. **Era blocks with labels** — positioned, colored rectangles with nicknames and year-range eyebrows
3. **Year Row** — the horizontal year axis
4. **Age Rows** — tabular data aligned to year columns
5. **C-POP Graph** — a line/area chart beneath everything

### Recommended Libraries

| Concern | Library | Why |
|---|---|---|
| C-POP chart | **d3-scale + d3-shape + React SVG** | Raw SVG rendered by React, using d3 modules for scale math and path generation. Avoids the coordinate-system alignment problem that Recharts would create (see Nefko's question below). |
| Year-to-pixel math | **d3-scale** | Industry-standard axis math. Small standalone package — we use D3 for the math only, not for rendering. React renders the DOM. |
| Zoom interaction | **React state** | The wireframe shows button-driven zoom (+/-, All, Range). That is just a `visibleYearRange` state; no gesture library needed. |
| Era blocks, Year Row, Age Rows | **React + CSS/Tailwind** | Standard positioned DOM elements whose widths and positions are driven by the d3-scale math. |
| Info panels (click into era) | **Counterfoil Kit** | Standard dialog/panel components. |

### Libraries to Add Later (if needed)
| Concern | Library | When |
|---|---|---|
| Drag-to-pan / pinch-to-zoom | **@use-gesture/react** | If we add gesture-based zoom beyond buttons. |
| Smooth zoom animations | **Framer Motion** | If we want animated transitions when the zoom level changes. |

### What We Intentionally Skip
- **Full D3 rendering** — D3's imperative DOM manipulation fights React's declarative model. We take only the scale math.
- **Canvas libraries (Konva, Pixi)** — Overkill. The timeline is positioned rectangles and text; DOM/SVG will perform fine for ~50 year cells.
- **Dedicated timeline libraries (vis-timeline, etc.)** — Too opinionated and niche. They would fight us when we need custom era blocks, age rows, and a synced chart.
- **Heavy state management (Redux, Zustand)** — Zoom state is local to this page/component tree. React context or lifted state is sufficient.

### Design-Philosophy Alignment
- **Consistent:** We are choosing well-known, widely-adopted libraries (Recharts, d3-scale) instead of building custom rendering — bias toward boring, proven tools.
- **Consistent:** Each layer (chart, timeline, age rows, era blocks) is a separate, composable component — aligns with "many small, boring files."
- **Consistent:** Rendering stays in React; d3-scale is pure math with no side effects — aligns with separating logic from UI.
- **Inconsistent:** Nothing identified so far.




**Nefko's Question: It seems like Recharts isn't as good of an answer as it once was. Maybe we should reconsider that decision.**

Agreed — Recharts should be dropped. The core problem is that every layer on this timeline shares one horizontal axis, but Recharts manages its own internal coordinate system (margins, padding, axis layout). Keeping two pixel-coordinate systems in sync is fragile and fights the "one shared scale" architecture.

The better answer is **raw SVG rendered by React, using `d3-scale` + `d3-shape`**:
- `d3-scale` (already in the plan) maps years to pixel positions.
- `d3-shape` generates SVG path strings from data points — its `line()` and `area()` generators take a data array and a scale function and return a `d` attribute for a `<path>` element.
- Tooltips are React state driven by mouse events on the SVG.

For a subtle background chart like C-POP, this is ~30–50 lines of component code. We don't need Recharts' legend system, axis rendering, responsive container, or animation framework. And we gain the crucial benefit: **one coordinate system for every layer**, driven by one `d3-scale` instance.

This is still well-known technology — D3's modular packages are the most widely used visualization primitives in the JS ecosystem. We're using D3 for "math + path generation" instead of only "math."

**Updated recommendation:** Replace "Recharts" with "`d3-scale` + `d3-shape` + React SVG" in the Recommended Libraries table above.

---

**Nefko's Question: On the drag-to-adjust era blocks, yes, I could see that being a future feature. What would we need to change (in our plan) to more gracefully transition to that?**

Five architectural decisions to make now so drag interactions can drop in later without a refactor:

1. **Derive era block positions from the shared scale, not hardcoded CSS.** Each era block's `left` and `width` should come from `scale(era.startYear)` and `scale(era.endYear) - scale(era.startYear)`. Later, drag gestures use the same scale's `.invert()` to map pixels back to years.
2. **Extract a "snap to year" utility.** A function that takes a pixel position and returns the nearest year boundary. Needed now for rendering; reused later for drag snapping.
3. **Expose era range changes as a callback, not only through form inputs.** If the component tree already has `onRangeChange(eraId, newStart, newEnd)`, adding drag is just a new caller of that function. If range changes only go through a text input in an info panel, drag requires plumbing a new update path.
4. **Extract overlap prevention as a pure function.** The PRD says eras cannot overlap. Build `canEraOccupyRange(eras, eraId, proposedStart, proposedEnd)` as a standalone utility so both form editing and future drag editing use the same validation.
5. **Keep era blocks as positioned DOM elements** (already the plan). DOM elements get pointer events and drag library compatibility for free. Canvas rendering would make drag much harder to add.

With these in place, the drag implementation later is: add `@use-gesture/react`, attach a drag handler to era edges, call `scale.invert()` to convert pixels to years, validate with the overlap utility, and call `onRangeChange`. No architectural changes needed.

