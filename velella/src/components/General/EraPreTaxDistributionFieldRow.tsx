import type { ReactNode } from "react";
import type { EraFacts, YearFactsFieldKey } from "../../types/era";
import EraPaneHelpButton from "./EraPaneHelpButton";

export const PRE_TAX_DISTRIBUTIONS_DESCRIPTION =
  'Distributions taken from "traditional" 401k accounts, Traditional IRAs, 403b\'s or other pre-tax accounts. This income is taxed at ordinary income rates. Do not include Roth distributions in this box.';

function EraPreTaxDistributionFactRow({
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
          description={PRE_TAX_DISTRIBUTIONS_DESCRIPTION}
        />
      </div>
      <div className="flex shrink-0 justify-end">{children}</div>
    </div>
  );
}

export interface EraPreTaxDistributionFieldRowProps {
  eraFacts: EraFacts;
  onUpdateEraFacts: (updater: (prev: EraFacts) => EraFacts) => void;
  renderOverrideAwareValue: (
    fieldKey: YearFactsFieldKey,
    label: string,
    value: number,
    onCommit: (value: number) => void
  ) => ReactNode;
}

export default function EraPreTaxDistributionFieldRow({
  eraFacts,
  onUpdateEraFacts,
  renderOverrideAwareValue,
}: EraPreTaxDistributionFieldRowProps) {
  const label = "Pre-Tax Distributions";

  return (
    <EraPreTaxDistributionFactRow label={label}>
      {renderOverrideAwareValue(
        "pre-tax-distributions",
        label,
        eraFacts.otherIncome.preTaxDistributions,
        (value) =>
          onUpdateEraFacts((prev) => ({
            ...prev,
            otherIncome: {
              ...prev.otherIncome,
              preTaxDistributions: value,
            },
          }))
      )}
    </EraPreTaxDistributionFactRow>
  );
}
