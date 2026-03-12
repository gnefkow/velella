# **Disable overscroll navigation on timeline table**
------------------------------------------------------

## **Overview**

When users scroll horizontally in the timeline table (e.g. to see income/expense columns), a multi-finger swipe can trigger the browser's back/forward navigation. This is jarring and can cause users to lose their place.

We will disable horizontal overscroll behavior on the timeline table's scroll container so that horizontal scrolling stays within the table and does not trigger browser navigation.

------------------------------------------------------

## **What to do**

Apply `overscroll-behavior-x: none` to the timeline table's scroll container.

- **File:** `velella/src/components/Timeline/TimelineTable.tsx`
- **Target:** The wrapper `div` that has `overflow-x-auto` (around line 163)
- **Change:** Add the Tailwind utility `overscroll-x-none` to that div's `className`

If `overscroll-x-none` is not available in the project's Tailwind config, use inline style `overscrollBehaviorX: 'none'` or add the utility to the Tailwind config.

------------------------------------------------------

## **Why**

- `overscroll-behavior-x: none` tells the browser not to propagate horizontal overscroll to the parent (the page), which prevents the back/forward swipe gesture from firing when the user hits the scroll boundary
- This is the most reliable, non-invasive way to reduce accidental navigation
- It does not block the gesture globally—only when the user is scrolling within the table container

------------------------------------------------------

## **Where to document**

Places to add comments so humans and bots understand what this code does and why:

1. **TimelineTable.tsx** – Inline comment directly above the scroll container `div` (the wrapper with `overflow-x-auto`). This is the primary place: anyone editing this component will see it.
2. **TimelineTable.tsx** – Optional: a brief note in the component’s JSDoc block (above `export default function TimelineTable`) mentioning that horizontal overscroll is disabled to prevent accidental back/forward navigation.
3. **This ticket (007)** – The ticket itself documents the “why” and context. Keep it as the reference for future readers.


