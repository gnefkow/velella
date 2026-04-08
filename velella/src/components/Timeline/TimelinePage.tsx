import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Text } from "../../../../../counterfoil-kit/src/index.ts";
import { calculateTimeline } from "../../engine/calculateTimeline";
import {
  addYearFieldOverrides,
  createYearFieldOverride,
  relinkYearFieldToEra,
  relinkYearFieldsToEra,
} from "../../services/eraService";
import type { Era } from "../../types/era";
import { applyFilingStatusGlobally } from "../../lib/filingStatus";
import type { FilingStatus, Scenario, YearInput } from "../../types/scenario";
import { useTaxReferenceData } from "../../hooks/useTaxReferenceData";
import { toTaxEstimatorReferenceData } from "../../services/taxReferenceDataService";
import EraDetailPane, { type EraDetailPaneHandle } from "../General/EraDetailPane";
import EraUnsavedChangesModal from "../General/EraUnsavedChangesModal";
import TimelineTable from "./TimelineTable";
import YearFactsPane from "./YearFactsPane";

interface TimelinePageProps {
  scenario: Scenario | null;
  loading: boolean;
  onPersist: (scenario: Scenario) => Promise<void>;
}

type TimelinePaneState =
  | { type: "none" }
  | { type: "year" }
  | { type: "era"; eraId: string };

type PendingPaneTarget =
  | { type: "none" }
  | { type: "year"; year: number }
  | { type: "era"; eraId: string; focusYear: number | null };

export default function TimelinePage({
  scenario,
  loading,
  onPersist,
}: TimelinePageProps) {
  const [localScenario, setLocalScenario] = useState<Scenario | null>(scenario);
  const [selectedYear, setSelectedYear] = useState<number | null>(
    scenario?.years[0]?.year ?? null
  );
  const [paneState, setPaneState] = useState<TimelinePaneState>({ type: "none" });
  const [pendingPaneTarget, setPendingPaneTarget] = useState<PendingPaneTarget | null>(null);
  const [showEraUnsavedModal, setShowEraUnsavedModal] = useState(false);
  const [showYearUnsavedModal, setShowYearUnsavedModal] = useState(false);
  const persistTimerRef = useRef<number | null>(null);
  const latestScenarioRef = useRef<Scenario | null>(scenario);
  const eraPaneRef = useRef<EraDetailPaneHandle | null>(null);
  const { taxReferenceData } = useTaxReferenceData();
  const taxEstimatorRef = useMemo(
    () =>
      taxReferenceData ? toTaxEstimatorReferenceData(taxReferenceData) : null,
    [taxReferenceData]
  );

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

  const handleOverrideInvestBlock = useCallback(
    (year: number) => {
      setLocalScenario((currentScenario) => {
        if (!currentScenario) return currentScenario;
        let updated = addYearFieldOverrides(currentScenario, year, [
          "modify-investment-details",
          "pre-tax-401k-contribution",
          "pre-tax-ira-contribution",
          "hsa-contribution",
          "roth-retirement",
          "taxable-investments",
        ]);
        updated = {
          ...updated,
          years: updated.years.map((y) =>
            y.year === year
              ? {
                  ...y,
                  modifyInvestmentDetails: true,
                  investmentBreakdown: {
                    preTax401kContribution: 0,
                    preTaxIraContribution: 0,
                    hsaContribution: 0,
                    rothRetirement: 0,
                    taxableInvestments: 0,
                  },
                }
              : y
          ),
        };
        latestScenarioRef.current = updated;
        schedulePersist(updated);
        return updated;
      });
    },
    [schedulePersist]
  );

  const handleRelinkInvestBlock = useCallback(
    (year: number) => {
      setLocalScenario((currentScenario) => {
        if (!currentScenario) return currentScenario;
        const updated = relinkYearFieldsToEra(currentScenario, year, [
          "modify-investment-details",
          "pre-tax-401k-contribution",
          "pre-tax-ira-contribution",
          "hsa-contribution",
          "roth-retirement",
          "taxable-investments",
        ]);
        latestScenarioRef.current = updated;
        schedulePersist(updated);
        return updated;
      });
    },
    [schedulePersist]
  );

  const handleBulkApplyFilingStatus = useCallback(
    (status: FilingStatus) => {
      setLocalScenario((currentScenario) => {
        if (!currentScenario) return currentScenario;
        const updated = applyFilingStatusGlobally(currentScenario, status);
        latestScenarioRef.current = updated;
        schedulePersist(updated);
        return updated;
      });
    },
    [schedulePersist]
  );

  const years = useMemo(
    () =>
      localScenario ? calculateTimeline(localScenario, taxEstimatorRef) : [],
    [localScenario, taxEstimatorRef]
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

  const selectedEra = useMemo(() => {
    if (paneState.type !== "era" || !localScenario) {
      return null;
    }
    return localScenario.eras?.find((era) => era.id === paneState.eraId) ?? null;
  }, [localScenario, paneState]);

  const openPaneTarget = useCallback(
    (target: PendingPaneTarget) => {
      if (!localScenario) {
        return;
      }

      if (target.type === "none") {
        setPaneState({ type: "none" });
        return;
      }

      if (target.type === "year") {
        setSelectedYear(target.year);
        setPaneState({ type: "year" });
        return;
      }

      if (target.focusYear !== null) {
        setSelectedYear(target.focusYear);
      }

      const hasEra = (localScenario.eras ?? []).some((era) => era.id === target.eraId);
      setPaneState(hasEra ? { type: "era", eraId: target.eraId } : { type: "none" });
    },
    [localScenario]
  );

  const flushPendingYearPersist = useCallback(() => {
    if (persistTimerRef.current !== null) {
      window.clearTimeout(persistTimerRef.current);
      persistTimerRef.current = null;
    }

    const nextToPersist = latestScenarioRef.current;
    if (!nextToPersist) {
      return;
    }
    void onPersist(nextToPersist);
  }, [onPersist]);

  const discardPendingYearChanges = useCallback(() => {
    if (persistTimerRef.current !== null) {
      window.clearTimeout(persistTimerRef.current);
      persistTimerRef.current = null;
    }
    // Revert to the last persisted parent snapshot when the user discards.
    setLocalScenario(scenario);
    latestScenarioRef.current = scenario;
  }, [scenario]);

  const requestPaneTransition = useCallback(
    (target: PendingPaneTarget) => {
      if (target.type === "year") {
        setSelectedYear(target.year);
      } else if (target.type === "era" && target.focusYear !== null) {
        setSelectedYear(target.focusYear);
      }

      if (paneState.type === "year" && target.type === "year") {
        openPaneTarget(target);
        return;
      }

      if (
        paneState.type === "era" &&
        selectedEra &&
        target.type === "era" &&
        paneState.eraId === target.eraId
      ) {
        openPaneTarget(target);
        return;
      }

      if (
        paneState.type === "era" &&
        selectedEra &&
        eraPaneRef.current?.hasUnsavedChanges()
      ) {
        setPendingPaneTarget(target);
        setShowEraUnsavedModal(true);
        return;
      }

      if (
        paneState.type === "year" &&
        target.type !== "year" &&
        persistTimerRef.current !== null
      ) {
        setPendingPaneTarget(target);
        setShowYearUnsavedModal(true);
        return;
      }

      openPaneTarget(target);
    },
    [openPaneTarget, paneState, selectedEra]
  );

  const handleSelectYear = useCallback(
    (year: number, openYearFactsPane = false) => {
      setSelectedYear(year);
      if (openYearFactsPane) {
        requestPaneTransition({ type: "year", year });
      }
    },
    [requestPaneTransition]
  );

  const handleSelectEra = useCallback(
    (era: Era, focusYear: number | null) => {
      requestPaneTransition({ type: "era", eraId: era.id, focusYear });
    },
    [requestPaneTransition]
  );

  const handleEraPaneClose = useCallback(() => {
    requestPaneTransition({ type: "none" });
  }, [requestPaneTransition]);

  const handleSaveEra = useCallback(
    (updated: Scenario) => {
      setLocalScenario(updated);
      latestScenarioRef.current = updated;
      void onPersist(updated);
    },
    [onPersist]
  );

  const handleYearModalSave = useCallback(() => {
    flushPendingYearPersist();
    setShowYearUnsavedModal(false);

    const target = pendingPaneTarget;
    setPendingPaneTarget(null);
    if (target) {
      openPaneTarget(target);
    }
  }, [flushPendingYearPersist, openPaneTarget, pendingPaneTarget]);

  const handleYearModalDiscard = useCallback(() => {
    discardPendingYearChanges();
    setShowYearUnsavedModal(false);

    const target = pendingPaneTarget;
    setPendingPaneTarget(null);
    if (target) {
      openPaneTarget(target);
    }
  }, [discardPendingYearChanges, openPaneTarget, pendingPaneTarget]);

  const handleEraModalSave = useCallback(() => {
    const didSave = eraPaneRef.current?.saveDraft() ?? false;
    if (!didSave) {
      return;
    }

    setShowEraUnsavedModal(false);
    const target = pendingPaneTarget;
    setPendingPaneTarget(null);
    if (target) {
      openPaneTarget(target);
    }
  }, [openPaneTarget, pendingPaneTarget]);

  const handleEraModalDiscard = useCallback(() => {
    setShowEraUnsavedModal(false);
    const target = pendingPaneTarget;
    setPendingPaneTarget(null);
    if (target) {
      openPaneTarget(target);
      return;
    }
    setPaneState({ type: "none" });
  }, [openPaneTarget, pendingPaneTarget]);

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
        <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-x-none overscroll-contain bg-bg-primary">
          <TimelineTable
            scenario={localScenario}
            years={years}
            selectedYear={activeSelectedYear}
            onSelectYear={handleSelectYear}
            onSelectEra={handleSelectEra}
            onUpdateYearInput={handleYearInputUpdate}
          />
        </div>
        {paneState.type === "year" && (
          <YearFactsPane
            scenario={localScenario}
            selectedYearInput={selectedYearInput}
            taxEstimatorRef={taxEstimatorRef}
            onUpdateYearInput={handleYearInputUpdate}
            onOverrideField={handleOverrideField}
            onRelinkField={handleRelinkField}
            onOverrideInvestBlock={handleOverrideInvestBlock}
            onRelinkInvestBlock={handleRelinkInvestBlock}
            onBulkApplyFilingStatus={handleBulkApplyFilingStatus}
          />
        )}
        {paneState.type === "era" && selectedEra && (
          <EraDetailPane
            key={selectedEra.id}
            ref={eraPaneRef}
            scenario={localScenario}
            era={selectedEra}
            taxEstimatorRef={taxEstimatorRef}
            onClose={handleEraPaneClose}
            onSave={handleSaveEra}
            onBulkApplyFilingStatus={handleBulkApplyFilingStatus}
          />
        )}
      </div>
      <EraUnsavedChangesModal
        isOpen={showEraUnsavedModal}
        onSave={handleEraModalSave}
        onDiscard={handleEraModalDiscard}
      />
      <EraUnsavedChangesModal
        isOpen={showYearUnsavedModal}
        onSave={handleYearModalSave}
        onDiscard={handleYearModalDiscard}
      />
    </div>
  );
}
