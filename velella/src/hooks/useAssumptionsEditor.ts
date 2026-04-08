import { useCallback, useEffect, useState } from "react";
import type { HouseholdMember, Scenario } from "../types/scenario";
import { generateMemberId } from "../lib/id";
import { rebuildYearsForRange } from "../services/scenarioService";

export function useAssumptionsEditor(
  saved: Scenario,
  onSave: (scenario: Scenario) => Promise<void>
) {
  const [scenario, setScenario] = useState<Scenario>(saved);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setScenario(saved);
  }, [saved]);

  const updateScenarioInfo = useCallback(
    (updates: Partial<Scenario["scenarioInfo"]>) => {
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
    },
    []
  );

  const updateAssumptions = useCallback(
    (updates: Partial<Scenario["assumptions"]>) => {
      setScenario((s) => ({
        ...s,
        assumptions: { ...s.assumptions, ...updates },
      }));
    },
    []
  );

  const addHouseholdMember = useCallback(() => {
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
  }, []);

  const updateHouseholdMember = useCallback(
    (index: number, member: HouseholdMember) => {
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
    },
    []
  );

  const deleteHouseholdMember = useCallback((index: number) => {
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
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await onSave(scenario);
    } finally {
      setSaving(false);
    }
  }, [onSave, scenario]);

  const handleRevert = useCallback(() => {
    setScenario(saved);
  }, [saved]);

  return {
    scenario,
    updateScenarioInfo,
    updateAssumptions,
    addHouseholdMember,
    updateHouseholdMember,
    deleteHouseholdMember,
    handleSave,
    handleRevert,
    saving,
  };
}
