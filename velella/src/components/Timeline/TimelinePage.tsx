import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Text } from "../../../../../counterfoil-kit/src/index.ts";
import { calculateTimeline } from "../../engine/calculateTimeline";
import { createYearFieldOverride, relinkYearFieldToEra } from "../../services/eraService";
import type { Scenario, YearInput } from "../../types/scenario";
import TimelineTable from "./TimelineTable";
import YearFactsPane from "./YearFactsPane";

interface TimelinePageProps {
  scenario: Scenario | null;
  loading: boolean;
  onPersist: (scenario: Scenario) => Promise<void>;
}

export default function TimelinePage({
  scenario,
  loading,
  onPersist,
}: TimelinePageProps) {
  const [localScenario, setLocalScenario] = useState<Scenario | null>(scenario);
  const [selectedYear, setSelectedYear] = useState<number | null>(
    scenario?.years[0]?.year ?? null
  );
  const persistTimerRef = useRef<number | null>(null);
  const latestScenarioRef = useRef<Scenario | null>(scenario);

  useEffect(() => {
    // The timeline keeps a local draft so edits can recalculate immediately
    // while persistence remains debounced in the parent hook.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalScenario(scenario);
    latestScenarioRef.current = scenario;
  }, [scenario]);

  const schedulePersist = useCallback(
    (updated: Scenario) => {
      latestScenarioRef.current = updated;
      if (persistTimerRef.current !== null) {
        window.clearTimeout(persistTimerRef.current);
      }
      persistTimerRef.current = window.setTimeout(() => {
        persistTimerRef.current = null;
        const nextToPersist = latestScenarioRef.current;
        if (!nextToPersist) return;
        void onPersist(nextToPersist);
      }, 150);
    },
    [onPersist]
  );

  useEffect(() => {
    return () => {
      if (persistTimerRef.current !== null) {
        window.clearTimeout(persistTimerRef.current);
      }
    };
  }, []);

  const handleYearInputUpdate = useCallback(
    (year: number, updater: (yearInput: YearInput) => YearInput) => {
      setLocalScenario((currentScenario) => {
        if (!currentScenario) {
          return currentScenario;
        }

        const updated: Scenario = {
          ...currentScenario,
          years: currentScenario.years.map((yearInput) =>
            yearInput.year === year ? updater(yearInput) : yearInput
          ),
        };

        latestScenarioRef.current = updated;
        schedulePersist(updated);
        return updated;
      });
    },
    [schedulePersist]
  );

  const handleOverrideField = useCallback(
    (year: number, fieldKey: string) => {
      setLocalScenario((currentScenario) => {
        if (!currentScenario) return currentScenario;
        const updated = createYearFieldOverride(currentScenario, year, fieldKey);
        latestScenarioRef.current = updated;
        void onPersist(updated);
        return updated;
      });
    },
    [onPersist]
  );

  const handleRelinkField = useCallback(
    (year: number, fieldKey: string) => {
      setLocalScenario((currentScenario) => {
        if (!currentScenario) return currentScenario;
        const updated = relinkYearFieldToEra(currentScenario, year, fieldKey);
        latestScenarioRef.current = updated;
        void onPersist(updated);
        return updated;
      });
    },
    [onPersist]
  );

  const years = useMemo(
    () => (localScenario ? calculateTimeline(localScenario) : []),
    [localScenario]
  );

  const activeSelectedYear = useMemo(() => {
    if (!localScenario || localScenario.years.length === 0) {
      return null;
    }

    if (
      selectedYear !== null &&
      localScenario.years.some((yearInput) => yearInput.year === selectedYear)
    ) {
      return selectedYear;
    }

    return localScenario.years[0]?.year ?? null;
  }, [localScenario, selectedYear]);

  const selectedYearInput = useMemo(
    () =>
      localScenario?.years.find((yearInput) => yearInput.year === activeSelectedYear) ??
      null,
    [activeSelectedYear, localScenario]
  );

  if (loading) {
    return (
      <div className="w-full px-[2em] min-w-0">
        <Text size="body1" hierarchy="secondary">
          Loading…
        </Text>
      </div>
    );
  }

  if (!localScenario) {
    return null;
  }

  return (
    <div className="flex min-h-0 flex-1 w-full min-w-0 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 min-w-0 overflow-hidden rounded border border-border-secondary">
        <YearFactsPane
          scenario={localScenario}
          selectedYearInput={selectedYearInput}
          onUpdateYearInput={handleYearInputUpdate}
          onOverrideField={handleOverrideField}
          onRelinkField={handleRelinkField}
        />
        <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-x-none overscroll-contain bg-bg-primary">
          <TimelineTable
            scenario={localScenario}
            years={years}
            selectedYear={activeSelectedYear}
            onSelectYear={setSelectedYear}
            onUpdateYearInput={handleYearInputUpdate}
          />
        </div>
      </div>
    </div>
  );
}
