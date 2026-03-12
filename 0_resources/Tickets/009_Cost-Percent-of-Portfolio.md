# **Implementing the Cost Percent of Portfolio**
--------------------------------------------------
We outline the concept of the C-POP (Cost Percent of Portoflio) in the [Logic and Vocabulary](/0_resources/PRD/1.1_logic-and-vocabulary.md). 

In this ticket, we implement and display this. 



### **C-POP is a calculated term.** 
--------------------------------------------------

`c-pop` 
- is a number (float).
- is calculated, we do not store it in the yaml, we store it in memory
- varies per year, each year will have a different `c-pop` value
- is calculated: `c-pop` =  `Expenses` / `portfolioEnd`



### **Rendering C-POP**
--------------------------------------------------
- C-POP displays on the `TimelineTable.tsx`
- the C-POP column displays to the right of "Portfolio End"
- The header is "C-POP"
- C-POP is a calculated field, so users cannot input in this cell
- C-POP is rendered as a percentage with two decimal points
  - Ex: 0.0212 is rendered as 2.12%
- Note: In the future, we will have additional style logic for different values here. 
- C-POP values in the column are right-justified. 



### **Implementation**
--------------------------------------------------
- Add `cPop` to the in-memory `Year` type. This value is derived data, so it lives in memory and is not persisted to YAML.
- Compute `cPop` inside `calculateTimeline.ts` while we are already iterating through the years and calculating `portfolioEnd`.
- Use the existing yearly `expenses` value as the numerator and `portfolioEnd` as the denominator.
- If `portfolioEnd <= 0`, store `null` for `cPop`. The dash (`"-"`) is a rendering concern, not a data-model concern.
- Update `TimelineTable.tsx` so it reads `cPop` from the `Year` data rather than re-computing it in the table.
- Add a new non-editable `C-POP` column immediately to the right of `Portfolio End`.
- Render valid `cPop` values as percentages with exactly two decimal places.
  - Example: `0.0212` renders as `2.12%`
- Render `null` `cPop` values as `"-"`.
- Right-justify the `C-POP` cells so the percentages are easy to scan visually.
- Do not add SWR comparison logic, milestone logic, or additional styling logic in this ticket. This ticket only computes and displays the raw C-POP value.



### **FAQ**

*What should happen when portfolioEnd <= 0?*
IF portfolioEnd is <=0, THEN: just display a dash "-"

*Is expenses definitely the persisted yearly input, or will future derived expense concepts matter here? Right now the ticket says Expenses / portfolioEnd, and today expenses is a plain yearly input. If later “expenses” becomes a rolled-up or derived value, we should decide whether C-POP always uses the user-entered annual expense field or some broader “total costs” concept.*
What we do know is that we will always have SOMETHING that is determining the "expense" for each year. We will one day have the ability for a user to choose a range of years and set the expenses for those years. However, even in that case, the "expenses" for each year will go into the yaml for each individual year (so this math problem to get C-POP will still function). 

*Should C-POP be computed in the engine or in the table layer*
Compute C-POP in the existing `calculateTimeline.ts` engine and store it on the `Year` object.

We should not compute it only in the table, because C-POP is not just a display concern. We already expect to hang future logic off of it in other parts of the app, such as SWR-related messaging or narrative summaries. Putting it on `Year` makes it part of the app's canonical per-year computed data model, which means other UI surfaces can use it without re-implementing the calculation.

We also do not need a separate engine file for this ticket. C-POP depends directly on values already available inside the yearly loop in `calculateTimeline.ts`, especially `expenses` and `portfolioEnd`. A separate engine would add another layer of indirection without giving us much benefit yet.

If we later build a broader layer of "timeline analysis" features, that may be a good moment to extract a second engine or analysis module. But for now, the cleanest choice is:
- put `cPop` in `Year`
- calculate it in `calculateTimeline.ts`
- let `TimelineTable.tsx` only render it

*Do we want C-POP included in the Year type, or only in TimelineRow?*
Let's put it in the `year`

*Should the cell always display two decimals, even for small or extreme values?*
yes. We want it to be right-justified in the column, If there are varying numbers of decimals, it'll look jagged and be hard to read. 

*Do we want any behavior tied to SWR now, or only the raw C-POP number?*
Not as part of this ticket. 

*Should the column be sortable/filterable later, or is it just a static display column for now?*
No, just display the numbers. 

*What test coverage is expected for this ticket?*
None. 

