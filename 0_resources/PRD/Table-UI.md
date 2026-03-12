I think we're learning something about the timeline table from a UI perspective. 

We're going to need to be able to see many YearFacts on the screen at the same time that we see the table. Trying to cram any more columns onto this table isn't going to work. 

What we're going to need is for each `year` (row) on the table to be selectable. Then, when something is selected, the right-side pane has the YearFacts for that year. 

The table just shows totals: Portfolio Start, (maybe total income?), Total expenses, Portfolio End, C-POP. 

That way, users can play with a host of numbers in a vertical format (in the pane) and see how it ripples through the portfolio. 

Do you think that it would be possible to build that interface wth the current TanStack table dependency that we have?