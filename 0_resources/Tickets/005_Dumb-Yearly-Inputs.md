# **Overview**
------------------------------------------------------
In this ticket, we're just doing two things:
- Creating inputs for users to put in variables for their scenarios
- storing those variables in the back-end

NOT in this ticket:
*In the future,* we will update the engine to do some math recalculation for this ticket. However, that is part of a future effort, not this ticket. 


# **What to do**
----------------------


### Add the "income-earner" variable to "Household Member"
- This is a boolean value. 
- By default, it is "true"
- It is stored in the Scenario Yaml
- It displays as a checkbox on the `HouseholdMemberLI.tsx` component on the Assumptions page for each HouseholdMember. 
  - WHEN the user changes the value on the HouseholdMemberLI component for that HouseholdMember AND pushes the button to update, THEN the yaml is updated. 

### ***Add HouseholdMember Columns***
For each Household Member, 
- We will display two columns:
  - **Age.** Age is calculated field. The current year displayed (in that row) minus their birth year.
    - Column Header is "{Nickname} Age" where "nickname" is the nickname given for that user in the "Assumptions" 
  - **Income.** Income is a user input. Users can type into this field (it is potentially different for each year).
    - IF for the HouseholdMember "income-earner=true", THEN the income column for that household member displays. 
    - The header is "{Nickname} {Income}"

### ***Add Expenses column***
There is ONE expenses column
- Expenses is NOT tied to the number of "Household Members"
- Expenses is an input - users can enter each number on the field for that row. 


### Data Storage
Age: calculated, stored in memory. Do NOT store age in the yaml.
- Age is derived from:
  - the year displayed in that row
  - the HouseholdMember birth year
- For this ticket, age logic is simple:
  - `age = rowYear - birthYear`
  - ignore month/day for the age calculation

HouseholdMember: store as stable ID (Nickname is not the ID)
- Each HouseholdMember should have:
  - `id` = stable string identifier used in code + yaml
    - constructed with a random UUID-like string. 
  - `nickname`
  - `birthday`
  - `income-earner`
- `nickname` is display text only and can change
- `id` is the thing that yearly income values map to
- Default `income-earner` to `true`
- If old yaml is missing `income-earner`, treat it as `true` and write it back that way when the scenario is saved

Choice:
Dense years array with one object per calendar year
- We are optimizing for a normal household planning horizon, not large data volume
- A scenario will usually have:
  - around 2 income earners
  - around 50 years
  - never more than about 100 years
- Because of that, it is fine to store a full row for every year in the scenario range
- This structure is preferred because:
  - it matches the table UI, which is row-based
  - it matches the future engine work, which will loop year-by-year
  - it keeps persisted user-authored inputs separate from derived calculated values

Each persisted year object should contain:
- `year`
- `expenses`
- `incomes`
  - `incomes` is an object keyed by HouseholdMember stable ID
  - each value is that household member's income for that year

Example shape:

```yaml
household-members:
  - id: kyle
    nickname: Kyle
    birthday: 12/02/1987
    income-earner: true
  - id: janice
    nickname: Janice
    birthday: 01/01/1986
    income-earner: true

years:
  - year: 2026
    expenses: 0
    incomes:
      kyle: 0
      janice: 0
  - year: 2027
    expenses: 0
    incomes:
      kyle: 0
      janice: 0
```

Storage rules:
- Store a dense `years` array for the full range from `year-start` through `year-end`
- Default all `expenses` values to `0`
- Default all yearly income values to `0`
- Store yearly income using HouseholdMember `id`, not nickname and not array index
- If `income-earner=false` for a HouseholdMember:
  - hide that member's income column in the timeline table
  - still show that member's age column
  - clear that member's stored income values across all years
- `income-earner=false` is NOT the same thing as income=`0`

Boundary with future engine work:
- The yaml stores user-authored yearly inputs:
  - expenses
  - income values by household member and year
- The engine should read those stored yearly inputs later when doing timeline math
- Derived values such as age and calculated portfolio values should remain in memory, not persisted in the yaml


### **Adding or removing income earners**
Adding:
- WHEN a new HouseholdMember is added with income-earner=true (event occurs when the user creates them on the Assumptions page, then clicks "Update" button)
  - THEN: generate the UUID for that user and set the income for all years to $0

Removing:
- WHEN a user removes an income earner by either (a) deleting the Household member entirely, or (b)by un-checking the income-earner checkbox (change only occurs when the user clicks the "update" button)
  - THEN: delete all of the "income" data for that household member in the yaml


### **IF year-start or year-end changes and there is already data**
In this case, preserve overlapping years, new years should be set to income=$0 for all income earners. Years that are NOT present in the new range can be deleted. 


### Column Order & Re-arrangement
On the TimelineTable.tsx....

#### Remove the YearNum column
We no longer need to see this column 

#### Column Order
Arrange the columns as:

| Year | Portfolio Amount | {Household Nickname 1} Age | {Household Nickname 1} Income | {Household Nickname 2} Age | {household Nickname 2} Income | {Household Nickname 3} | Expenses | Portfolio |

In this order:
- All household members where income=true are listed first
- Then household members where income=false
  


### What to do with the old yaml
- if a household member is missing id, generate one
- if missing income-earner, default to true
- if missing years, generate the full dense array from year-start to year-end
- if a year exists but is missing an income key for a current income earner, fill it with 0
- Replace the existing values for the yaml for "Kyle" and "Janice" with random UUIDs
  