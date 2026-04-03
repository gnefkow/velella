import type { ReactNode } from "react";
import type { EraFacts, YearFactsFieldKey } from "../../types/era";
import EraPaneHelpButton from "./EraPaneHelpButton";

export const ROTH_DISTRIBUTIONS_DESCRIPTION =
  "Distributions from Roth IRA or Roth 401k accounts. These distributions are not taxed.";

function EraRothDistributionsFactRow({
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
          description={ROTH_DISTRIBUTIONS_DESCRIPTION}
        />
      </div>
      <div className="flex shrink-0 justify-end">{children}</div>
    </div>
  );
}

export interface EraRothDistributionsFieldRowProps {
  eraFacts: EraFacts;
  onUpdateEraFacts: (updater: (prev: EraFacts) => EraFacts) => void;
  renderOverrideAwareValue: (
    fieldKey: YearFactsFieldKey,
    label: string,
    value: number,
    onCommit: (value: number) => void
  ) => ReactNode;
}

export default function EraRothDistributionsFieldRow({
  eraFacts,
  onUpdateEraFacts,
  renderOverrideAwareValue,
}: EraRothDistributionsFieldRowProps) {
  const label = "Roth Distributions";

  return (
    <EraRothDistributionsFactRow label={label}>
      {renderOverrideAwareValue(
        "roth-distributions",
        label,
        eraFacts.otherIncome.rothDistributions,
        (value) =>
          onUpdateEraFacts((prev) => ({
            ...prev,
            otherIncome: {
              ...prev.otherIncome,
              rothDistributions: value,
            },
          }))
      )}
    </EraRothDistributionsFactRow>
  );
}
