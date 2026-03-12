# Background. 



### Change `portfolio-growth-rate` to be `market_return`
*Using the term "growth" is too confusing, let's be more specific.*
- in the yaml
- in the UI


### **Defining a CalcSession**
Let's coin the term "`CalcSession`. A `CalcSession` is what happens when a user:
- changes a variable, then
- pushes Enter, then
- the app re-calculates all of the values and
- updates the UI with the new values. 

We do not need something called "CalcSession" in the code, it is just something that we will use in documentation to describe human behaviours. 
We can expect that a user's session with the app will consist of multiple CalcSessions as they play with the numbers 


**User Story: What is a "year"**
*We will need to start handing data off of the idea of a "year". Before defining it in our database, let's see how a user might think about it:*
"In 2031, Jack takes a sabbatical and just works at the coffeeshop working part time, where he only makes $20,000 in income. Jill has continued to climb the corporate ladder, and now she is making $110,000. They move to New York, so their expenses are now around $140,000 a year. They also buy a car and put their kid in private school. Since they made less than they spent, they withdrew $10,000 from the portfolio. At the beginning of the year, their portfolio balance was $1,000,000. By the beginning of the next year (2032), their principle went down by $10,000, but their portfolio increased by $60,000, giving it a nominal value of $1,000,050 minus inflation"

We are NOT going to do all of this logic in this ticket. However, we should think about this as we're moving forward. 


Specifically, we have:
- the `Year` (number, ex: 2031)

and things that relate to it:
- portfolio-amount (number): defined by the previous year's numbers (more on that below)
- expenses
- income (for each household member)
- era (we'll define this later)


# To build in this ticket. 
Let's start to structure "Year" by first creating a simple compound-interest calculator. 

### Create the .ts file
First: in src/engine create `calculateTimeline.ts`


### The calculateTimeline function
`calculateTimeline.ts` contains the function for creating the "years"


**Specs for the initial calculation function**

This ticket should create the most minimal version of the timeline calculation engine. The purpose of this first version is to populate `portfolio-amount` for every `year` in the timeline using only the starting portfolio and a constant annual real return. This is a stepping stone toward later year-by-year logic for income, spending, investing, and withdrawals.

**Inputs**
- FROM `scenario-info`:
  - `year-start`
  - `year-end`
- FROM `assumptions`:
  - `initial-portfolio`
  - `inflation-rate`
  - `market-return`

**Output**
- A generated list of `year` objects in memory for every year from `year-start` through `year-end`
- Each generated `year` must include:
  - `year-number`
  - `year`
  - `portfolio-amount`

**Meaning of these numbers**
- `market-return` means the annual market appreciation assumption before inflation
- `portfolio-amount` in this ticket should be a **real** dollar amount, not a nominal amount
- Therefore, this ticket should use the precise real-return formula, not the shortcut `market-return - inflation-rate`

**Real-return formula**
- `real-return-rate = ((1 + market-return) / (1 + inflation-rate)) - 1`
- `real-return-factor = (1 + market-return) / (1 + inflation-rate)`

**Calculation behavior**
- Create `year 0` using `year-start`
- `year 0` should have:
  - `year-number = 0`
  - `year = year-start`
  - `portfolio-amount = initial-portfolio`
- Then loop forward one year at a time until `year-end`
- For each step, take the previous year's `portfolio-amount` and generate the next year's `portfolio-amount`
- Formula:
  - `next-year-portfolio-amount = previous-year-portfolio-amount * real-return-factor`
- The result becomes the `portfolio-amount` for the next generated `year`

**Shape of the engine**
- The calculation logic should live in one easy-to-find place so we can inspect the math later
- The engine should work year-by-year in sequence: `year n -> year n+1`
- The engine should generate the full timeline on each `CalcSession`
- The generated timeline should then be used by the front-end table display

**Important boundary**
- The scenario file should remain the source of user-entered inputs
- The per-year calculated values for this ticket should be generated in memory as derived data
- Do **not** treat the calculated yearly `portfolio-amount` values as user-authored scenario inputs

**Out of scope for this ticket**
- income
- expenses
- investing
- withdrawals
- fees
- taxes
- variable market returns by year
- inflation changes by year
- nominal-dollar timeline values

**Why this structure**
- This app will eventually allow users to change values in specific years
- A year-by-year engine is the clearest way to support that future behavior
- The number of years in a human planning timeline is small enough that recalculating the whole timeline each time is acceptable








