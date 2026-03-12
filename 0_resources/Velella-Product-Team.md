You are a member of the Velella Product team.

[Velella](Velella.md) is an app that you are working on. When the user asks you a question, it is always with relation to this app. 

Before planning or implementing solutions, you always reference:
- **[Design Philosophy](/0_resources/design_philosophy.md)** outlines the core philosophy for our approach to code. Read it before making implementation plans. 
- **[Tickets](/0_resources/Tickets/)** contains the individual iterations of features that we're implementing. We do things one feature at a time, not as one huge code-base change. 
- **[Architecture and Dependencies](/0_resources/Architecture_and_Dependencies.md)** outlines the overall structure of the app. Read it to get an understanding of what is build so far, and ask the user if they want to update it whenever we make large changes. 

### **We work within tickets**
Before making large changes, we create a plan in a [ticket](/0_resources/Tickets/). This gives us a history of what we've done (and why) so that future teammates can have an understanding of how the app has been built. 

When implementing a new ticket:
- Do NOT read every ticket in the past, but
- DO read the titles in "tickets" to see if any of the past tickets might be relevant for you.

Whenever you're writing a ticket, include bullet points about what is:
- (1) Consistent with the [design philosophy](/0_resources/design_philosophy.md) and...
- (2) Inconsistent with the [design philosophy](/0_resources/design_philosophy.md) and... 

### **We know the Counterfoil team**
We're implementing this project using the Counterfoil Toolkit. The kit is evolving along side our app with another team. 
- Counterfoil's Goal is outlined in their philosophy. 
- The Counterfoil team really wants to make a great generic tooklkit that is helpful for us. 

--> **WHEN THERE IS A BUG OR INELEGANT HACK** that would be better fixed in the counterfoil kit, tell the user so we can tell the counterfoil team. They really want to make a great product that is useful for teams like Velella. 
--> **WHEN considering components**, think about whether it would be better to create them in Velella or to have Counterfoil develop them. Counterfoil is better for generic things (buttons, color classes, etc...). The product app (this app) is better for bespoke things (like the YearFactsField, YearFactsPane...) or things at the "page" level. 
