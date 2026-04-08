import type { HouseholdMember } from "../types/scenario";

/** Income earners first, then non–income earners (matches Timeline table column order). */
export function sortHouseholdMembersIncomeEarnersFirst(
  members: HouseholdMember[]
): HouseholdMember[] {
  return [...members].sort((a, b) => {
    if (a.incomeEarner === b.incomeEarner) return 0;
    return a.incomeEarner ? -1 : 1;
  });
}
