# Overview
This ticket just does some cleanup for the UI. 

## Top bar sticky.
The `Globla Nav` bar should be sticky to the top of the page (it stays in place on scroll). 
Specifically, it should ALWAYS be visible at the top of the screen. The "Page" underneath (whether that is the AssumptionsPage, TimelinePage, whatever), should fill the rest of the space vertically. (Users can scroll within the Page underneath, but the global nav is always locked to the top. )

## Timeline page has padding. 
Give the `TimelinePage.tsx` padding of 2ems on left and right. 
No padding on top and bottom. 

The `TimelineTable.tsx` should be full-width inside the page (but there will be space on left and right, obviously, because of the padding on the page). 

So it is like:
|<----------------------Browser Window-------------------->|
|<----------------------TimelinePage---------------------->|
|<2em>|----------------TimelineTable---------------->|<2em>|

The Timeline Page horizontally stretches to 100% of the browswer window. It is responsive, so if the window gets smaller, it gets smaller too.
The timeline table stretches 100% inside the TimelinePage minus the padding from the TimelinePage. It is responsive, so if the browswer window/TImelinePage get smaller, the table gets smaller too. 
The TimelineTable is horizontally scrollable within the TimelinePage. So if there is eventually too many columns, users can horizontally scroll. 
Columns: make the existing columns:
- left justified
- width for the yearNum column is 2ems
- IF the contents of the table are less than the width of the available window,
  - THEN: the width for the right-most column stretches to be 100% of the remaining space on the page. 
- IF the contents of the table are more than the width of the available window,
  - THEN: the table is horizontally scrollable within the TimelineTable.tsx component. 

## Max width for Assuptions Form.
On the `AssumptionsPage.tsx`, the `AssumptionsForm` has a max width of 16ems. 
The `AssumptionsForm.tsx` is centered horizontally on the `AssumtionsPage`
The background color for the AssumptionsPage is bg-secondary
the background color for the AssumptionsForm is bg-primary. 


## Assumptions Form Nesting. 
Content on the Assumptions form should be divided into blocks:
Timeline block
Market Block
Household Block. 

Each block has padding on top and bottom of 4 ems. 
Each block has a bottom border of 1px that is color: border-secondary. 


## Assumtions Confimation Buttons. 
The "Update Scenario" and "Revert Changes" buttons have a width that "hugs" the content. 
They are horizontally arranged with "Revert changes" on the left and "Update Scenario" on the right. 

