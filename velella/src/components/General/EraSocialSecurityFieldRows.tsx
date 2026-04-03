import type { ReactNode } from "react";
import type { EraFacts, YearFactsFieldKey } from "../../types/era";
import type { HouseholdMember } from "../../types/scenario";
import { eraIncludesSocialSecurityEligibleYearForMember } from "../../lib/socialSecurityEligibility";
import EraPaneHelpButton from "./EraPaneHelpButton";

const SS_ROW_DESCRIPTION =
  "Expected annual Social Security benefit payments for this income earner.";

function EraSocialSecurityFactRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex w-full min-w-0 max-w-full items-center justify-between gap-4 bg-bg-primary py-[0.5em]">
      <div className="flex min-w-0 flex-1 items-center gap-1 text-left">
        <p
          className="min-w-0 text-body-1 text-text-primary"
          style={{ margin: 0 }}
        >
          {label}
        </p>
        <EraPaneHelpButton
          label={`Show explanation for ${label}`}
          description={SS_ROW_DESCRIPTION}
        />
      </div>
      <div className="flex shrink-0 justify-end">{children}</div>
    </div>
  );
}

export interface EraSocialSecurityFieldRowsProps {
  incomeEarners: HouseholdMember[];
  eraFacts: EraFacts;
  eraStartYear: number | null;
  eraEndYear: number | null;
  onUpdateEraFacts: (updater: (prev: EraFacts) => EraFacts) => void;
  renderOverrideAwareValue: (
    fieldKey: YearFactsFieldKey,
    label: string,
    value: number,
    onCommit: (value: number) => void
  ) => ReactNode;
}

export default function EraSocialSecurityFieldRows({
  incomeEarners,
  eraFacts,
  eraStartYear,
  eraEndYear,
  onUpdateEraFacts,
  renderOverrideAwareValue,
}: EraSocialSecurityFieldRowsProps) {
  if (eraStartYear == null || eraEndYear == null) {
    return null;
  }

  const visible = incomeEarners.filter((m) =>
    eraIncludesSocialSecurityEligibleYearForMember(
      m.birthday,
      eraStartYear,
      eraEndYear
    )
  );

  if (visible.length === 0) {
    return null;
  }

  return (
    <>
      {visible.map((member) => {
        const fieldKey =
          `social-security-benefits-${member.id}` as YearFactsFieldKey;
        const label = `${member.nickname || "Member"}'s Social Security Benefit(Annual)`;

        return (
          <EraSocialSecurityFactRow key={member.id} label={label}>
            {renderOverrideAwareValue(
              fieldKey,
              label,
              eraFacts.socialSecurityBenefits[member.id] ?? 0,
              (value) =>
                onUpdateEraFacts((prev) => ({
                  ...prev,
                  socialSecurityBenefits: {
                    ...prev.socialSecurityBenefits,
                    [member.id]: value,
                  },
                }))
            )}
          </EraSocialSecurityFactRow>
        );
      })}
    </>
  );
}
