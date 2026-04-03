import type { YearFactsFieldKey } from "../../types/era";
import type { YearInput } from "../../types/scenario";
import type { FocusAndEditHandle } from "./EditableAmountCell";
import YearFactsField from "./YearFactsField";
import { PRE_TAX_DISTRIBUTIONS_DESCRIPTION } from "../General/EraPreTaxDistributionFieldRow";

export interface YearFactsPreTaxDistributionFieldProps {
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

export default function YearFactsPreTaxDistributionField({
  yearInput,
  registerCell,
  getEraState,
  focusNextField,
  onUpdateYearInput,
  onOverrideField,
  onRelinkField,
}: YearFactsPreTaxDistributionFieldProps) {
  const fieldKey = "pre-tax-distributions" as const;
  const { eraLocked, eraOverride } = getEraState(fieldKey);

  return (
    <YearFactsField
      title="Pre-Tax Distributions"
      description={PRE_TAX_DISTRIBUTIONS_DESCRIPTION}
      value={yearInput.otherIncome.preTaxDistributions}
      onCommit={(value) =>
        onUpdateYearInput((yi) => ({
          ...yi,
          otherIncome: {
            ...yi.otherIncome,
            preTaxDistributions: value,
          },
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
