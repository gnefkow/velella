import type { YearFactsFieldKey } from "../../types/era";
import type { YearInput } from "../../types/scenario";
import { ROTH_CONVERSIONS_DESCRIPTION } from "../../lib/rothConversions";
import type { FocusAndEditHandle } from "./EditableAmountCell";
import YearFactsField from "./YearFactsField";

export interface YearFactsRothConversionsFieldProps {
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

export default function YearFactsRothConversionsField({
  yearInput,
  registerCell,
  getEraState,
  focusNextField,
  onUpdateYearInput,
  onOverrideField,
  onRelinkField,
}: YearFactsRothConversionsFieldProps) {
  const fieldKey = "roth-conversions" as const;
  const { eraLocked, eraOverride } = getEraState(fieldKey);

  return (
    <YearFactsField
      title="Roth Conversions"
      description={ROTH_CONVERSIONS_DESCRIPTION}
      value={yearInput.misc.rothConversions}
      onCommit={(value) =>
        onUpdateYearInput((yi) => ({
          ...yi,
          misc: { ...yi.misc, rothConversions: value },
        }))
      }
      cellKey={fieldKey}
      registerCell={registerCell}
      onFocusNext={() => focusNextField(fieldKey)}
      eraLocked={eraLocked}
      eraOverride={eraOverride}
      onOverride={() => onOverrideField?.(yearInput.year, fieldKey)}
      onRelink={() => onRelinkField?.(yearInput.year, fieldKey)}
    />
  );
}
