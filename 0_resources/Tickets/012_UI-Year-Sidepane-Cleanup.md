# **Sidepane Cleanup**
------------------------------------------------------------
This ticket cleans up the UI for the YearFactsSidePane and TimelineTable interactions. 

We'll progress in parts. All of these are on the `TimelinePage.tsx`

## **Step 1: Get rid of the "Timeline" title div.** 
------------------------------------------------------------
There is a div that has the word "Timeline" on it. Remove it, we do not need this div. 



## **Step 2: Independent scroll, full screen** 
------------------------------------------------------------
The TimelineTable and the YearFactsSidePane both need to be implemented with these characteristics:
- Height: they fill 100% of the vertical height of the screen that is not taken up by the GlobalBar. 
- Their contents scroll INSIDE these divs (components). 
- That means there is no real way for a user to scroll the PAGE (or the TimelinePage component), users can only scroll WITHIN TimelineTable or YearFactsSidePane
- Scroll is independent between these two. (so scrolling up in TimelineTable has no effect on the scroll of YearFactsSidePane, or visa versa)


## **Step 3: re-size Sidepane width** 
------------------------------------------------------------
The Year Facts should be 18em wide. 

## **Step 4: top chopped off of Sidepane and TimelineTable**
------------------------------------------------------------
The top of YearFactsSidePane and TimelineTable are being cut off by the top bar. It feels like the top bar is "Laying on top of" these other divs, rather than having them stacked underneath. 

Expected behaviour: in both YearFactsSidePane and TimelineTable, the "top" of these components should be the visible top of them, not the top of the browser window. In other words, they should filld the full vertical height. 

For example, if the top bar is 100px tall, and the browser window is 900px tall, then the height of YearFactsSidePane should be 900 - 100 = 800px tall. 

*How to fix it:*

The issue: GlobalNav is `position: fixed`, so it overlays the page. The `main` element uses `pt-16` (64px) to reserve space, but the nav's actual rendered height can exceed 64px (padding + TabBar + title + border), causing overlap.

**Option A — Match padding to nav height (simplest):**
- Measure the actual GlobalNav height (e.g. via DevTools) and set `main`'s top padding to match.
- If the nav is ~72–80px, use `pt-[72px]` or `pt-20` (80px) in `App.tsx` on the `main` element.

**Option B — Shared constant (recommended):**
- Define a shared constant for the nav height (e.g. in a layout config or GlobalNav).
- Use it for both the GlobalNav wrapper and `main`'s `padding-top`, so they stay in sync.

**Option C — In-flow layout (no fixed nav):**
- Remove `fixed` from GlobalNav and make it the first flex child of the app layout.
- The nav then occupies space in the flow, and `main` (flex-1) fills the rest without needing top padding.




## **Step 5: fix table width**
------------------------------------------------------------
The table has some crazy width that is making it go off of the screen. 
- Make all columns 12 ems



