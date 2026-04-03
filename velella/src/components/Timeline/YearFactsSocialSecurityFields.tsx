import type { HouseholdMember, YearInput } from "../../types/scenario";
import type { YearFactsFieldKey } from "../../types/era";
import type { FocusAndEditHandle } from "./EditableAmountCell";
import YearFactsField from "./YearFactsField";
import { memberIsSocialSecurityEligibleAge } from "../../lib/socialSecurityEligibility";

const SS_DESCRIPTION =
  "Expected annual Social Security benefit payments for this income earner.";

export interface YearFactsSocialSecurityFieldsProps {
  calendarYear: number;
  incomeEarners: HouseholdMember[];
  yearInput: YearInput;
  registerCell: (key: string, handle: FocusAndEditHandle | null) => void;
  getEraState: (fieldKey: YearFactsFieldKey) => {
    eraLocked: boolean;
    eraOverride: boolean;
  };
  focusNextField: (fieldKey: string) => boolean;
  onUpdateYearInput: (
    updater: (yearInput: YearInput) => YearInput
  ) => void;
  onOverrideField?: (year: number, fieldKey: string) => void;
  onRelinkField?: (year: number, fieldKey: string) => void;
}

export default function YearFactsSocialSecurityFields({
  calendarYear,
  incomeEarners,
  yearInput,
  registerCell,
  getEraState,
  focusNextField,
  onUpdateYearInput,
  onOverrideField,
  onRelinkField,
}: YearFactsSocialSecurityFieldsProps) {
  const eligible = incomeEarners.filter((m) =>
    memberIsSocialSecurityEligibleAge(m.birthday, calendarYear)
  );

  if (eligible.length === 0) {
    return null;
  }

  return (
    <>
      {eligible.map((member) => {
        const fieldKey =
          `social-security-benefits-${member.id}` as YearFactsFieldKey;
        const { eraLocked, eraOverride } = getEraState(fieldKey);
        const name = member.nickname || "Member";

        return (
          <YearFactsField
            key={fieldKey}
            title={`${name}'s Social Security Benefit(Annual)`}
            description={SS_DESCRIPTION}
            value={yearInput.socialSecurityBenefits[member.id] ?? 0}
            onCommit={(value) =>
              onUpdateYearInput((yi) => ({
                ...yi,
                socialSecurityBenefits: {
                  ...yi.socialSecurityBenefits,
                  [member.id]: value,
                },
              }))
            }
            cellKey={fieldKey}
            registerCell={registerCell}
            onFocusNext={() => focusNextField(fieldKey)}
            eraLocked={eraLocked}
            eraOverride={eraOverride}
            onOverride={() =>
              onOverrideField?.(yearInput.year, fieldKey)
            }
            onRelink={() => onRelinkField?.(yearInput.year, fieldKey)}
          />
        );
      })}
    </>
  );
}
