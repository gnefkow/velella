# **Add Income and Expenses to Calculation Engine**
------------------------------------------------------

*In previous tickets*, we added the Income and Expense columns to the `TimelineTable` which saves these values to the Scenario yaml. However, in the prior tickets, this is just unused data that simply displays on the page. 

*In this ticket* we update the `calculateTimeline.ts` function to incorporate the income and expenses in the calculation. 


## **UX Goal**
------------------------------------------------------
This ticket further's a user's ability to make long-term financial projections in the "CoastFIRE" style by enabling them to see how their portfolio gorws or diminished based on contributions or withdrawals they make each year. 

This simplistic model assumes that the change in their portfolio is the sum of all income minus expenses. (We assume that the user is counting things like taxes or money saved as cash as an "expense").

*Simplistic approach to "time" in a year.* This model assumes that all contributions/withdrawals are made at the end of the year. This is, of course, unrealistic, but we're fine with that. 




## **How it should work**
------------------------------------------------------

Our goal is to augment the way the yearly portfolio values are calculated. 


Right now, the `calculateTimeline.ts` service works like this:

- Calculate the `realReturnFactor`,
- Create `year 0` using `initialPortfolio`
- THEN, for each next `year`, multiply the `prev.portfolioAmount` by the `realReturnFactor` to get the next `portfolioAmount`
- Loop through all of the `years` to get the `portfolioAmount` for each year. 

What we want to do now is:
- Calculate the `realReturnFactor`, (same as before)
- Treat all numbers in this ticket as **real dollars**
  - `initialPortfolio` is in real dollars
  - yearly `Income` values are in real dollars
  - yearly `Expenses` values are in real dollars
  - `portfolioBeg`, `cashChange`, and `portfolioEnd` are all in real dollars
- Treat each row in the table as one calendar year with these derived values:
  - `portfolioBeg`
  - `cashChange`
  - `portfolioEnd`
- `portfolioBeg` is the portfolio amount at the beginning of that row's year
  - For the first row (`year-start`), `portfolioBeg = initialPortfolio`
  - For each later row, `portfolioBeg = previous year's portfolioEnd`
- Calculate the `cashChange`
  - The `cashChange` is a number that represents the contribution (if positive) or withdrawal (if negative) of cash to/from the portfolio. 
  - the `cashChange` = (all) `Income` - `Expenses`
  - `cashChange` is a number (float)
  - blank or missing yearly values should behave as `0`
  - Examples:
    - If Jack had income of $100,000 and Jill had income of $120,000 and they had expenses of $80,000,
      - THEN `cashChange` =  100,000 + 120,000 - $80,000 = $140,000
    - IF: Jack had income of $20,000 and Jill had income of $20,000 and they had expense of $100,000
      - THEN `cashChange` = 20,000 + 20,000 - 100,000 = -$60,000
- Calculate the `portfolioEnd`
  - `cashChange` is layered *after* the market return is considered. 
  - `portfolioEnd` = (`portfolioBeg` * `realReturnFactor`) + `cashChange`
  - `portfolioEnd` may go below `0`
  - Do NOT floor `portfolioEnd` at `$0`
  - A negative `portfolioEnd` means the household is in debt
- Then move to the next year
  - the next row's `portfolioBeg` = the previous row's `portfolioEnd`
  - the final displayed year should still calculate a normal `portfolioEnd`, even though there is no next row

### **First Row Behavior**
------------------------------------------------------
- The first displayed year should follow the same row logic as every other year
- This means the first row should show:
  - `portfolioBeg = initialPortfolio`
  - `cashChange = (all Income) - Expenses` for `year-start`
  - `portfolioEnd = (portfolioBeg * realReturnFactor) + cashChange`
- Therefore, in the first row, `portfolioBeg` and `portfolioEnd` should usually be different
- The only time they should be the same is if the math happens to produce the same number
  - for example, if the real return is `0` and the `cashChange` is `0`
- Do NOT treat the first row as a special "seed-only" row in the UI
- The first row is a normal calculated year, just like every row after it

### **Data Boundary**
------------------------------------------------------
- The yaml remains the source of truth for user-authored inputs only
  - scenario info
  - assumptions
  - household members
  - yearly `Income`
  - yearly `Expenses`
- The following values are calculated each time the engine runs and should live in memory only:
  - `portfolioBeg`
  - `cashChange`
  - `portfolioEnd`
- Do NOT store calculated portfolio values or `cashChange` in the yaml
- It is fine to recalculate the full timeline on each change because the number of years in a human planning timeline is small

### **Engineering Updates**
------------------------------------------------------
- Rename the underlying TypeScript model to match the new row semantics
- Do NOT keep using a single calculated `portfolioAmount` field as the main derived model for this ticket
- The engine and the in-memory timeline data should use names that reflect the distinct derived values:
  - `portfolioBeg`
  - `cashChange`
  - `portfolioEnd`
- UI labels and the underlying in-memory TypeScript model should agree on this naming



### **UI Updates**
------------------------------------------------------
- Add "Change"
  - The Change column should now display to the right of "Expenses"
  - The header for the "Change" column is: "Change"
  - The change column displays the `cashChange` for that `year`
  - Display `cashChange` as a signed currency value
- Rename "Portfolio" to be "Portfolio End"
  - For the furtheset left column, change the header to "Portfolio End"
- Rename "Portfolio Amount" to be "Portfolio Beg."