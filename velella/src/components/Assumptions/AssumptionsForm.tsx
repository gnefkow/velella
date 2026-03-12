import { useState, useEffect } from "react";
import {
  Button,
  InputField,
  Stack,
  Text,
} from "../../../../../counterfoil-kit/src/index.ts";
import type { Scenario, HouseholdMember } from "../../types/scenario";
import { generateMemberId } from "../../lib/id";
import { rebuildYearsForRange } from "../../services/scenarioService";
import HouseholdMemberLI from "./HouseholdMemberLI";

interface AssumptionsFormProps {
  saved: Scenario;
  onSave: (scenario: Scenario) => Promise<void>;
}

export default function AssumptionsForm({ saved, onSave }: AssumptionsFormProps) {
  const [scenario, setScenario] = useState<Scenario>(saved);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setScenario(saved);
  }, [saved]);

  const updateScenarioInfo = (updates: Partial<Scenario["scenarioInfo"]>) => {
    setScenario((s) => {
      const next = { ...s, scenarioInfo: { ...s.scenarioInfo, ...updates } };
      const newStart = next.scenarioInfo.yearStart;
      const newEnd = next.scenarioInfo.yearEnd;
      if (
        newStart !== s.scenarioInfo.yearStart ||
        newEnd !== s.scenarioInfo.yearEnd
      ) {
        next.years = rebuildYearsForRange(s, newStart, newEnd);
      }
      return next;
    });
  };

  const updateAssumptions = (updates: Partial<Scenario["assumptions"]>) => {
    setScenario((s) => ({
      ...s,
      assumptions: { ...s.assumptions, ...updates },
    }));
  };

  const addHouseholdMember = () => {
    const newId = generateMemberId();
    setScenario((s) => {
      const newMember: HouseholdMember = {
        id: newId,
        nickname: "",
        birthday: "",
        incomeEarner: true,
      };
      const years = s.years.map((yr) => ({
        ...yr,
        wageIncome: { ...yr.wageIncome, [newId]: 0 },
      }));
      return {
        ...s,
        householdMembers: [...s.householdMembers, newMember],
        years,
      };
    });
  };

  const updateHouseholdMember = (index: number, member: HouseholdMember) => {
    setScenario((s) => {
      const prev = s.householdMembers[index];
      const next = s.householdMembers.map((m, i) =>
        i === index ? member : m
      );
      let years = s.years;
      if (prev.incomeEarner && !member.incomeEarner) {
        years = s.years.map((yr) => {
          const wageIncome = { ...yr.wageIncome };
          delete wageIncome[prev.id];
          return { ...yr, wageIncome };
        });
      } else if (!prev.incomeEarner && member.incomeEarner) {
        years = s.years.map((yr) => ({
          ...yr,
          wageIncome: { ...yr.wageIncome, [member.id]: 0 },
        }));
      }
      return { ...s, householdMembers: next, years };
    });
  };

  const deleteHouseholdMember = (index: number) => {
    setScenario((s) => {
      const removed = s.householdMembers[index];
      const years = s.years.map((yr) => {
        const wageIncome = { ...yr.wageIncome };
        delete wageIncome[removed.id];
        return { ...yr, wageIncome };
      });
      return {
        ...s,
        householdMembers: s.householdMembers.filter((_, i) => i !== index),
        years,
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(scenario);
    } finally {
      setSaving(false);
    }
  };

  const handleRevert = () => {
    setScenario(saved);
  };

  const yearStartStr = String(scenario.scenarioInfo.yearStart);
  const yearEndStr = String(scenario.scenarioInfo.yearEnd);
  const inflationPct = (scenario.assumptions.inflationRate * 100).toString();
  const marketReturnPct = (scenario.assumptions.marketReturn * 100).toString();
  const safeWithdrawalRatePct = (
    scenario.assumptions.safeWithdrawalRate * 100
  ).toString();

  const blockClass = "py-[4em] border-b border-border-secondary";

  return (
    <Stack gap="lg">
      <div className={blockClass}>
        <Stack gap="m">
          <Text size="h3" hierarchy="primary">
            Timeline
          </Text>
          <Stack gap="sm">
            <InputField
              label="Year Start"
              type="number"
              value={yearStartStr}
              onChange={(v: string) =>
                updateScenarioInfo({ yearStart: parseInt(v, 10) || 0 })
              }
            />
            <InputField
              label="Year End"
              type="number"
              value={yearEndStr}
              onChange={(v: string) =>
                updateScenarioInfo({ yearEnd: parseInt(v, 10) || 0 })
              }
            />
          </Stack>
        </Stack>
      </div>

      <div className={blockClass}>
        <Stack gap="m">
          <Text size="h3" hierarchy="primary">
            Market
          </Text>
          <Stack gap="sm">
            <InputField
              label="Initial Portfolio ($)"
              type="number"
              value={String(scenario.assumptions.initialPortfolio)}
              onChange={(v: string) =>
                updateAssumptions({
                  initialPortfolio: parseInt(v, 10) || 0,
                })
              }
            />
            <InputField
              label="Inflation Rate (%)"
              type="number"
              value={inflationPct}
              onChange={(v: string) =>
                updateAssumptions({
                  inflationRate: (parseFloat(v) || 0) / 100,
                })
              }
            />
            <InputField
              label="Market Return (%)"
              type="number"
              value={marketReturnPct}
              onChange={(v: string) =>
                updateAssumptions({
                  marketReturn: (parseFloat(v) || 0) / 100,
                })
              }
            />
          </Stack>
        </Stack>
      </div>

      <div className={blockClass}>
        <Stack gap="m">
          <Text size="h3" hierarchy="primary">
            Safe Withdrawal Rate
          </Text>
          <Text size="body2" hierarchy="secondary">
            Choose your Safe Withdrawal Rate
          </Text>
          <Stack gap="sm">
            <InputField
              label="Safe Withdrawal Rate (%)"
              type="number"
              value={safeWithdrawalRatePct}
              onChange={(v: string) => {
                const pct = parseFloat(v) || 0;
                const clamped = Math.max(0.1, Math.min(12, pct));
                updateAssumptions({ safeWithdrawalRate: clamped / 100 });
              }}
            />
          </Stack>
        </Stack>
      </div>

      <div className={blockClass}>
        <Stack gap="m">
          <Text size="h3" hierarchy="primary">
            Household
          </Text>
          <Button variant="secondary" onClick={addHouseholdMember}>
            Add Household Member
          </Button>
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

      <div className="flex justify-between gap-4">
        <Button variant="secondary" onClick={handleRevert} width="hug">
          Revert Changes
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={saving} width="hug">
          Update Scenario
        </Button>
      </div>
    </Stack>
  );
}
