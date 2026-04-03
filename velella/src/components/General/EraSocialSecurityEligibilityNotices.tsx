import type { HouseholdMember } from "../../types/scenario";
import EraPaneHelpButton from "./EraPaneHelpButton";
import { memberCrossesSocialSecurityEligibilityDuringEra } from "../../lib/socialSecurityEligibility";

export interface EraSocialSecurityEligibilityNoticesProps {
  incomeEarners: HouseholdMember[];
  eraStartYear: number | null;
  eraEndYear: number | null;
}

export default function EraSocialSecurityEligibilityNotices({
  incomeEarners,
  eraStartYear,
  eraEndYear,
}: EraSocialSecurityEligibilityNoticesProps) {
  if (eraStartYear == null || eraEndYear == null) {
    return null;
  }

  const crossers = incomeEarners.filter((m) =>
    memberCrossesSocialSecurityEligibilityDuringEra(
      m.birthday,
      eraStartYear,
      eraEndYear
    )
  );

  if (crossers.length === 0) {
    return null;
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-2 px-0 py-1">
      {crossers.map((member) => {
        const name = member.nickname || "Member";
        return (
          <div
            key={member.id}
            className="flex w-full min-w-0 items-start gap-1 rounded-md bg-bg-secondary px-2 py-2"
          >
            <p
              className="min-w-0 flex-1 text-body-1 text-text-primary"
              style={{ margin: 0 }}
            >
              {name} will turn 59 during this era. Social Security benefits do
              not start until age 59.
            </p>
            <EraPaneHelpButton
              label={`Velella recommendation for ${name}'s Social Security timing`}
              description={`Velella Recommendation: For more accurate calculations, start a new "era" for when ${name} will start taking social security benefits.`}
            />
          </div>
        );
      })}
    </div>
  );
}
