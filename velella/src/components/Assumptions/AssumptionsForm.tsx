import { type ReactNode } from "react";
import { Plus } from "lucide-react";
import {
  Button,
  Input,
  InputField,
  Stack,
  Text,
} from "../../../../../counterfoil-kit/src/index.ts";
import type { Scenario, HouseholdMember } from "../../types/scenario";
import EraPaneAmountInput from "../General/EraPaneAmountInput";
import AssumptionsSteppedPercentInput from "./AssumptionsSteppedPercentInput";
import HouseholdMemberLI from "./HouseholdMemberLI";

interface AssumptionsFormProps {
  scenario: Scenario;
  updateScenarioInfo: (updates: Partial<Scenario["scenarioInfo"]>) => void;
  updateAssumptions: (updates: Partial<Scenario["assumptions"]>) => void;
  addHouseholdMember: () => void;
  updateHouseholdMember: (index: number, member: HouseholdMember) => void;
  deleteHouseholdMember: (index: number) => void;
}

function AssumptionsSectionTitle({
  title,
  trailing,
}: {
  title: string;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex w-full min-w-0 max-w-full items-center justify-between gap-4">
      <Text
        size="h5"
        hierarchy="primary"
        weight="heavy"
        className="min-w-0 flex-1 text-left"
      >
        {title}
      </Text>
      {trailing != null ? (
        <div className="flex shrink-0 items-center justify-end gap-2">
          {trailing}
        </div>
      ) : null}
    </div>
  );
}

/** Label left, control right — matches `EraPaneFactRow` + `EraPaneAmountInput` width. */
function AssumptionsLabeledInputRow({
  label,
  children,
  controlClassName = "flex w-[11.6875rem] shrink-0 justify-end [&>input]:text-right",
}: {
  label: string;
  children: ReactNode;
  controlClassName?: string;
}) {
  return (
    <div className="flex w-full min-w-0 max-w-full items-center justify-between gap-4 bg-bg-primary py-[0.5em]">
      <div className="flex min-w-0 flex-1 items-center text-left">
        <p
          className="min-w-0 text-body-1 text-text-primary"
          style={{ margin: 0 }}
        >
          {label}
        </p>
      </div>
      <div className={controlClassName}>{children}</div>
    </div>
  );
}

export default function AssumptionsForm({
  scenario,
  updateScenarioInfo,
  updateAssumptions,
  addHouseholdMember,
  updateHouseholdMember,
  deleteHouseholdMember,
}: AssumptionsFormProps) {
  const yearStartStr = String(scenario.scenarioInfo.yearStart);
  const yearEndStr = String(scenario.scenarioInfo.yearEnd);
  const safeWithdrawalRatePct = (
    scenario.assumptions.safeWithdrawalRate * 100
  ).toString();

  const blockClass = "py-[2em] border-b border-border-secondary";

  return (
    <Stack gap="lg" className="w-full min-w-0">
      <div className={blockClass}>
        <Stack gap="m">
          <AssumptionsSectionTitle title="Timeline" />
          <div className="flex min-w-0 w-full flex-col gap-0">
            <AssumptionsLabeledInputRow label="Year Start">
              <Input
                type="number"
                value={yearStartStr}
                onChange={(v: string) =>
                  updateScenarioInfo({ yearStart: parseInt(v, 10) || 0 })
                }
              />
            </AssumptionsLabeledInputRow>
            <AssumptionsLabeledInputRow label="Year End">
              <Input
                type="number"
                value={yearEndStr}
                onChange={(v: string) =>
                  updateScenarioInfo({ yearEnd: parseInt(v, 10) || 0 })
                }
              />
            </AssumptionsLabeledInputRow>
          </div>
        </Stack>
      </div>

      <div className={blockClass}>
        <Stack gap="m">
          <AssumptionsSectionTitle
            title="Household"
            trailing={
              <Button
                variant="secondary"
                size="md"
                icon={<Plus size={18} strokeWidth={2} aria-hidden />}
                aria-label="Add household member"
                onClick={addHouseholdMember}
              />
            }
          />
          <Stack gap="sm">
            {scenario.householdMembers.map((member, i) => (
              <HouseholdMemberLI
                key={member.id}
                member={member}
                onChange={(m) => updateHouseholdMember(i, m)}
                onDelete={() => deleteHouseholdMember(i)}
              />
            ))}
          </Stack>
        </Stack>
      </div>

      <div className={blockClass}>
        <Stack gap="m">
          <AssumptionsSectionTitle title="Safe Withdrawal Rate" />
          <Text size="body2" hierarchy="secondary">
            Choose your Safe Withdrawal Rate
          </Text>
          <div className="flex min-w-0 w-full flex-col gap-0">
            <AssumptionsLabeledInputRow label="Safe Withdrawal Rate (%)">
              <Input
                type="number"
                value={safeWithdrawalRatePct}
                onChange={(v: string) => {
                  const pct = parseFloat(v) || 0;
                  const clamped = Math.max(0.1, Math.min(12, pct));
                  updateAssumptions({ safeWithdrawalRate: clamped / 100 });
                }}
              />
            </AssumptionsLabeledInputRow>
          </div>
        </Stack>
      </div>

      <div className={blockClass}>
        <Stack gap="m">
          <AssumptionsSectionTitle title="Market" />
          <div className="flex min-w-0 w-full flex-col gap-0">
            <AssumptionsLabeledInputRow label="Initial Portfolio ($)">
              <EraPaneAmountInput
                label="Initial Portfolio ($)"
                value={scenario.assumptions.initialPortfolio}
                onCommit={(initialPortfolio) =>
                  updateAssumptions({ initialPortfolio })
                }
              />
            </AssumptionsLabeledInputRow>
            <AssumptionsLabeledInputRow
              label="Inflation Rate (%)"
              controlClassName="flex shrink-0 items-center justify-end"
            >
              <AssumptionsSteppedPercentInput
                ariaLabel="Inflation Rate (percent)"
                valuePercent={scenario.assumptions.inflationRate * 100}
                onCommitPercent={(pct) =>
                  updateAssumptions({ inflationRate: pct / 100 })
                }
              />
            </AssumptionsLabeledInputRow>
            <AssumptionsLabeledInputRow
              label="Market Return (%)"
              controlClassName="flex shrink-0 items-center justify-end"
            >
              <AssumptionsSteppedPercentInput
                ariaLabel="Market Return (percent)"
                valuePercent={scenario.assumptions.marketReturn * 100}
                onCommitPercent={(pct) =>
                  updateAssumptions({ marketReturn: pct / 100 })
                }
              />
            </AssumptionsLabeledInputRow>
          </div>
        </Stack>
      </div>
    </Stack>
  );
}
