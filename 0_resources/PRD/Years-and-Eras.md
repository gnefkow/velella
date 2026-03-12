
The `year` is the central planning object in Velella.

Users author **Yearly Planning Facts** for each year (or group of years). These inputs describe the financially relevant activities of that year, such as work income, savings actions, withdrawals, Roth conversions, and major expenses.

The **Timeline Calculation Engine** evaluates those yearly inputs and derives the values that matter for projection, including taxes, total expenses, and *outputs* the net portfolio change and ending portfolio value.

The **Tax Estimation Engine** takes as *inputs* some of the *Yearly Planning Facts* provided by the user, then *outputs* a high-level estimate for the taxes that users will pay in a given year. This estimate is added to the aggregated `expenses` for that `year`. 




`YearFacts` bubbles up to:
    - Income
    - Expenses

`Income` is the sum of:
    - Income from all HouseHold members that year. 
    - Income from realized Long-term capital Gains
    - Income from realized Short Term Capital Gains
    - Income from retirement distributions
    - Misc. Income

`Expenses` is the sum of:
    - Household Expenses (user direct input)
    - Tax Expenses (generated with the Tax Estimation Engine)
    - Misc Expenses (User names and direclty inputs)

Then, we have some sub-things:
- Taxes: the Tax Estimator Engine feeds into `Expenses`
- Distribution Engine --> outputs facts about distributions that users take. For instance, calculates tax outputs (for the tax estimator) and portfolio modifiers based on whether the distribution was Roth, 401k, etc...


## **Era: A Group of Years**
*User-Oriented Background*
CoastFIRE Planners do not plan one year at a time: they think about things in multi-year time spans. "For three years, we're going to work hard and make money, then we'll spend 2 years travelling in a sailboat, then we'll spend 5 years in Mexico for our child's elementary school years...." etc.... 

The `era` object is the object that gives users a handle for grouping their years. It improves things for users by (1) letting them thing about their life as a narrative timeline (not just a list of years) and (2) letting them aggregate year inputs (so they don't have to fill out 30-50 separate YearFacts forms). 

### *The `era` Object*
Eras consist of three groups of things:
1.  **Era Data.** Narrative data that users can use to decorate their era.
2.  **Years Range (list).** The list of `years` that are included in the `era`
3.  **Era Facts.** Facts that users can input into an `era` that cascade down into the `years` that are included in the `era`.
  
#### **Era Data**
- Unique ID: a randomly generated (non-user-facing) number that identifies the 
- Era Name: Users can input the name of the era.
- Era Description: Users can input up to 720 characters describing the era. 

#### **Years Range (List)**
Users can identify a range of years that are included in this era. 
The range:
- Must be continuous (there is exactly one start year and and one end year, it is all in one continuous range)
  - This is a hard rule: we have no plans to change this in the future. 
- Must be within the year range from the "assumptions"
- By default, years are not a part of an era, users must put a year into an era. 
- A single `year` CANNOT be a part of more than one `era`
  - The UI will be designed to actively prevent this overlap.
- It is not required for for all years to be in an `era`, `years` can stand alone. (In fact, that is the default)
- Changing the range:
  - WHEN users add a year to a range: Immediately the `era`facts` override that year. 
  - WHEN a user removes a `year` from the `era`, the year retains whatever the values are that it had (from the era) until the user changes them.

#### **Era Facts**
Era facts are the same list of "year facts", but they belong to an era. 
WHEN a user enters Era Facts, they immediately cascade down, updating the years that are included in the era. 
IF a `year` is part of an `era`, users can override the inheretance:
- They must expliditly do so: WHEN the year is added to the `ear`, THEN all Year Facts are overridden by the `era` immediately. (Only after that can they create an override)
- There is a note in the YearFacts for that year that shows tthat something has been over-ridden and there is a revert button. 
- If a `year` in an `era` has been overriden, it ONLY applies to that `year`. All other `year`s in that era remain unchanged. 
- 

*Question:* "Are era facts expected to include every type of year fact, or only a subset of year facts that make sense to apply across multiple years?"
Reply: what facts (other than the calendar year, person age, etc... which are not in the yaml) would be not the same each year? Nothing that is calculated should be in `era-facts`, only user inputs. What of these user inputs would we expect to be different?

*Question* Is the primary user value more about narrative planning and timeline comprehension, or more about reducing data-entry burden? Put differently, which of those two goals should win when they conflict?
It is more about narrative, narrative is always the most important. 
However, an important part of narrative control is helping people understand things at an abstracted level. Managing 8-10 "year facts" across 50 years of planning would be a very bad user experience. 


*Question* Should eras have any semantic meaning beyond name/description/range, such as affecting summaries, charts, or scenario comparisons?
Eventually, probably, but I'm not sure. 

*Do you picture users thinking in terms of a few large life phases, or many small tactical blocks? That answer probably affects how lightweight creation/editing needs to feel.*
Hard to say. I would think about it in 5-3 year blocks. Some will be longer, like 10 or 15 years. We can imagine that things further in the future would be in larger blocks. 

## Open Questions

*Question:* What is the source of truth for inherited values?
Should era facts live on the `era` and be resolved into each `year` dynamically, or should they be copied into each `year` whenever the era changes?


*Question:* What is the granularity of overrides?
When a user overrides inheritance on a `year`, are they overriding one field at a time, or detaching the whole year from the era?

*Question:* What exactly does "revert" mean for an override?
If a user reverts an overridden field on a `year`, should it snap back to the era's current value, or to the era value that existed at the moment the override was created?

*Question:* What should happen when an `era` is deleted?
Should deleting an era behave the same as removing all of its years from the era, meaning each year keeps whatever values it currently has until the user changes them?

*Question:* What should happen if the assumptions year range changes?
If the assumptions no longer include some years in an existing era, should the era be automatically truncated, invalidated, or require the user to resolve it?

*Question:* How should users create eras in the UI?
Should users create an era from the timeline, from a specific `year`, from a dedicated "add era" control, or through multiple entry points?

*Question:* How visible should the narrative layer be?
If narrative is the primary value of eras, where should the era name and description appear beyond the edit form?

*Question:* How should inheritance state be communicated in the UI?
How will users tell the difference between a standalone `year`, a `year` inheriting from an `era`, a partially overridden `year`, and a `year` that used to belong to an era?

*Question:* How much confirmation should be required for range edits?
If a user changes an era's range and that action will immediately overwrite many years, should the UI confirm the action first or should it happen instantly?

*Question:* Does any downstream logic need to know about inheritance?
Do summaries, charts, tax estimation, and other engines only care about the resolved `year` facts, or do any of them need to know whether a value came directly from a `year` or from an `era`?


## Decision: `Era` Uses a Dumb-Push Model

We want `era` to be a narrative and bulk-authoring object, not a calculation object.

### Why
- The app's calculation logic already treats `year` as the central planning object. Portfolio calculations, timeline calculations, and future engines like tax estimation already expect to read from `year`.
- Moving live inheritance logic into `era` would create unnecessary plumbing complexity across the app.
- Overrides become much simpler if they live on the `year`. For example, if an era covers 2030-2034 but 2032 is special, that exception should remain local to the `year` rather than forcing the `era` to manage per-year exception logic.
- This matters even more as calculations become more sophisticated. Future engines may use multiple `year` inputs and derive outputs for that specific year. That logic stays much cleaner if it always reads directly from the resolved `year`.

### Rule
- `Era` pushes user-input facts down into the `year`s that are in its range.
- `Year` remains the canonical object for all calculations.
- A `year` that is in an `era` can have a field-level override.
- Timeline and portfolio calculations continue to operate on `year` exactly as they do today.
- Future downstream engines should also consume `year`, not `era`.

### Nuance
- Even in this model, the app may still need lightweight metadata so it knows which `year` fields are still following the `era` and which have been overridden.
- That metadata is for editing behavior, not for calculation behavior.