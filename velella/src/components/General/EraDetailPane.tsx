import {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button } from "../../../../../counterfoil-kit/src/index.ts";
import type { Era, YearFactsFieldKey } from "../../types/era";
import type { FilingStatus, Scenario } from "../../types/scenario";
import type { TaxEstimatorReferenceData } from "../../types/taxReferenceData";
import { buildDefaultEraFacts } from "../../lib/eraFacts";
import {
  defaultFederalTaxSourceForYears,
  expensesWithSyncedTaxTotal,
} from "../../lib/yearFacts";
import {
  getYearDropdownOptions,
  yearsInRange,
} from "../../lib/eraHelpers";
import {
  applyEraOverrideDraftToScenario,
  buildEraOverrideDraftFromScenario,
  buildOverrideSummary,
  reconcileEraOverrideDraftForYears,
  type EraOverrideDraft,
} from "../../lib/eraOverrideDraft";
import { buildEraOverrideFieldDescriptors } from "../../lib/eraOverrideFields";
import { createEra, updateEra, deleteEra } from "../../services/eraService";
import { resolveYearInputWithEraFacts } from "../../lib/resolveEraYearInput";
import EraFactsForm from "./EraFactsForm";
import EraDeleteModal from "./EraDeleteModal";
import EraPaneHeader from "./EraPaneHeader";

export interface EraDraft {
  nickname: string;
  description: string;
  startYear: number | null;
  endYear: number | null;
  eraFacts: Era["eraFacts"];
}

interface EraDetailPaneProps {
  scenario: Scenario;
  era: Era | null;
  taxEstimatorRef?: TaxEstimatorReferenceData | null;
  onClose: () => void;
  onSave: (scenario: Scenario) => void;
  onBulkApplyFilingStatus?: (status: FilingStatus) => void;
}

export interface EraDetailPaneHandle {
  hasUnsavedChanges: () => boolean;
  saveDraft: () => boolean;
}

function buildInitialDraft(
  scenario: Scenario,
  era: Era | null
): EraDraft {
  const incomeEarnerIds = scenario.householdMembers
    .filter((m) => m.incomeEarner)
    .map((m) => m.id);

  if (era) {
    return {
      nickname: era.nickname,
      description: era.description,
      startYear: era.startYear,
      endYear: era.endYear,
      eraFacts: era.eraFacts,
    };
  }

  return {
    nickname: "",
    description: "",
    startYear: null,
    endYear: null,
    eraFacts: buildDefaultEraFacts(incomeEarnerIds),
  };
}

function buildInitialOverrideDraft(
  scenario: Scenario,
  era: Era | null
): EraOverrideDraft {
  if (!era) {
    return {};
  }

  const descriptors = buildEraOverrideFieldDescriptors(
    scenario.householdMembers.filter((member) => member.incomeEarner)
  );

  return buildEraOverrideDraftFromScenario(
    scenario,
    era.id,
    yearsInRange(era.startYear, era.endYear),
    descriptors
  );
}

const EraDetailPane = forwardRef<EraDetailPaneHandle, EraDetailPaneProps>(function EraDetailPane(
  {
    scenario,
    era,
    taxEstimatorRef = null,
    onClose,
    onSave,
    onBulkApplyFilingStatus,
  }: EraDetailPaneProps,
  ref
) {
  const [draft, setDraft] = useState<EraDraft>(() =>
    buildInitialDraft(scenario, era)
  );
  const [draftOverridesByField, setDraftOverridesByField] =
    useState<EraOverrideDraft>(() => buildInitialOverrideDraft(scenario, era));
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  /** After a successful save, parent state is async; skip unsaved prompt until props catch up. */
  const savedForCloseRef = useRef(false);

  const incomeEarners = useMemo(
    () => scenario.householdMembers.filter((m) => m.incomeEarner),
    [scenario.householdMembers]
  );
  const overrideFieldDescriptors = useMemo(
    () => buildEraOverrideFieldDescriptors(incomeEarners),
    [incomeEarners]
  );
  const draftEraYears = useMemo(() => {
    if (draft.startYear === null || draft.endYear === null) {
      return [];
    }

    return yearsInRange(draft.startYear, draft.endYear);
  }, [draft.endYear, draft.startYear]);

  const resolvedYearInputsForEra = useMemo(() => {
    if (draft.startYear === null || draft.endYear === null) {
      return [];
    }
    return draftEraYears.map((calendarYear) =>
      resolveYearInputWithEraFacts(
        scenario,
        calendarYear,
        draft.eraFacts,
        draftOverridesByField
      )
    );
  }, [
    scenario,
    draft.eraFacts,
    draftOverridesByField,
    draftEraYears,
    draft.startYear,
    draft.endYear,
  ]);

  const defaultEraFactsForNewEra = useMemo(
    () =>
      buildDefaultEraFacts(
        scenario.householdMembers
          .filter((m) => m.incomeEarner)
          .map((m) => m.id)
      ),
    [scenario.householdMembers]
  );
  const previousDraftEraYearsRef = useRef<number[]>(draftEraYears);

  const baselineOverrideDraft = useMemo(
    () => buildInitialOverrideDraft(scenario, era),
    [scenario, era]
  );

  const hasChanges = useMemo(() => {
    const overridesDirty =
      JSON.stringify(draftOverridesByField) !==
      JSON.stringify(baselineOverrideDraft);

    if (!era) {
      return (
        draft.nickname.trim() !== "" ||
        draft.description.trim() !== "" ||
        draft.startYear !== null ||
        draft.endYear !== null ||
        JSON.stringify(draft.eraFacts) !==
          JSON.stringify(defaultEraFactsForNewEra) ||
        overridesDirty
      );
    }
    return (
      draft.nickname !== era.nickname ||
      draft.description !== era.description ||
      draft.startYear !== era.startYear ||
      draft.endYear !== era.endYear ||
      JSON.stringify(draft.eraFacts) !== JSON.stringify(era.eraFacts) ||
      overridesDirty
    );
  }, [
    baselineOverrideDraft,
    defaultEraFactsForNewEra,
    draft,
    draftOverridesByField,
    era,
  ]);

  const canSave = useMemo(() => {
    if (!draft.nickname.trim()) return false;
    if (draft.startYear === null || draft.endYear === null) return false;
    if (draft.startYear > draft.endYear) return false;
    return true;
  }, [draft]);

  const { yearStart, yearEnd } = scenario.scenarioInfo;

  const startOptions = useMemo(
    () =>
      getYearDropdownOptions(
        yearStart,
        yearEnd,
        scenario.eras ?? [],
        era?.id,
        draft.startYear,
        draft.endYear,
        true
      ),
    [yearStart, yearEnd, scenario.eras, era?.id, draft.startYear, draft.endYear]
  );

  const endOptions = useMemo(
    () =>
      getYearDropdownOptions(
        yearStart,
        yearEnd,
        scenario.eras ?? [],
        era?.id,
        draft.startYear,
        draft.endYear,
        false
      ),
    [yearStart, yearEnd, scenario.eras, era?.id, draft.startYear, draft.endYear]
  );

  useEffect(() => {
    setDraftOverridesByField((current) =>
      reconcileEraOverrideDraftForYears(
        current,
        previousDraftEraYearsRef.current,
        draftEraYears
      )
    );
    previousDraftEraYearsRef.current = draftEraYears;
  }, [draftEraYears]);

  useEffect(() => {
    if (era || draft.startYear === null || draft.endYear === null) {
      return;
    }

    setDraft((currentDraft) => {
      if (currentDraft.eraFacts.expenses.selectedFederalTaxAmount !== 0) {
        return currentDraft;
      }

      const yearsInDraftRange = scenario.years.filter(
        (yearInput) =>
          yearInput.year >= currentDraft.startYear! &&
          yearInput.year <= currentDraft.endYear!
      );
      const nextSource = defaultFederalTaxSourceForYears(yearsInDraftRange);

      if (currentDraft.eraFacts.expenses.federalTaxSource === nextSource) {
        return currentDraft;
      }

      return {
        ...currentDraft,
        eraFacts: {
          ...currentDraft.eraFacts,
          expenses: expensesWithSyncedTaxTotal({
            ...currentDraft.eraFacts.expenses,
            federalTaxSource: nextSource,
          }),
        },
      };
    });
  }, [draft.endYear, draft.startYear, era, scenario.years]);

  const overrideSummariesByField = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(draftOverridesByField)
          .map(([fieldKey, valuesByYear]) => [
            fieldKey,
            buildOverrideSummary(
              fieldKey as YearFactsFieldKey,
              valuesByYear,
              draftEraYears
            ),
          ])
          .filter(([, summary]) => summary !== "")
      ) as Partial<Record<YearFactsFieldKey, string>>,
    [draftEraYears, draftOverridesByField]
  );

  const handleSaveFieldOverrides = useCallback(
    (
      fieldKey: YearFactsFieldKey,
      nextValuesByYear: Record<number, number> | null
    ) => {
      setDraftOverridesByField((current) => {
        if (!nextValuesByYear || Object.keys(nextValuesByYear).length === 0) {
          const rest = { ...current };
          delete rest[fieldKey];
          return rest;
        }

        return {
          ...current,
          [fieldKey]: nextValuesByYear,
        };
      });
    },
    []
  );

  const saveDraft = useCallback((): boolean => {
    if (!canSave) return false;
    savedForCloseRef.current = false;

    try {
      const updatedScenario =
        era
          ? updateEra(scenario, era.id, {
              nickname: draft.nickname.trim(),
              description: draft.description,
              startYear: draft.startYear!,
              endYear: draft.endYear!,
              eraFacts: draft.eraFacts,
            })
          : createEra(scenario, {
              nickname: draft.nickname.trim(),
              description: draft.description,
              startYear: draft.startYear!,
              endYear: draft.endYear!,
              eraFacts: draft.eraFacts,
            });

      const targetEraId =
        era?.id ??
        updatedScenario.eras?.[updatedScenario.eras.length - 1]?.id;

      const scenarioWithOverrides =
        targetEraId !== undefined
          ? applyEraOverrideDraftToScenario(
              updatedScenario,
              targetEraId,
              draftOverridesByField,
              overrideFieldDescriptors
            )
          : updatedScenario;

      onSave(scenarioWithOverrides);
      savedForCloseRef.current = true;
      return true;
    } catch (err) {
      console.error("Failed to save era:", err);
      return false;
    }
  }, [
    canSave,
    draft,
    draftOverridesByField,
    era,
    onSave,
    overrideFieldDescriptors,
    scenario,
  ]);

  const handleSaveAndClose = useCallback(() => {
    const didSave = saveDraft();
    if (didSave) {
      onClose();
    }
  }, [onClose, saveDraft]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (!e.metaKey && !e.ctrlKey) return;
      if (!hasChanges || !canSave) return;
      e.preventDefault();
      handleSaveAndClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [hasChanges, canSave, handleSaveAndClose]);

  const handleDelete = useCallback(() => {
    if (!era) return;
    const updated = deleteEra(scenario, era.id);
    onSave(updated);
    setShowDeleteModal(false);
    onClose();
  }, [era, scenario, onSave, onClose]);

  const hasChangesRef = useRef(hasChanges);
  useEffect(() => {
    hasChangesRef.current = hasChanges;
  }, [hasChanges]);

  useEffect(() => {
    savedForCloseRef.current = false;
  }, [draft, draftOverridesByField]);

  useImperativeHandle(
    ref,
    () => ({
      hasUnsavedChanges: () =>
        !savedForCloseRef.current && hasChangesRef.current,
      saveDraft,
    }),
    [saveDraft]
  );

  return (
    <aside className="flex h-full min-h-0 w-[512px] shrink-0 flex-col overflow-hidden self-stretch border-l border-border-secondary bg-bg-primary">
      <div
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-contain"
        style={{ paddingLeft: 24, paddingRight: 24 }}
      >
        <div className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col bg-bg-primary">
          <EraPaneHeader
            nickname={draft.nickname}
            description={draft.description}
            startYear={draft.startYear}
            endYear={draft.endYear}
            startOptions={startOptions}
            endOptions={endOptions}
            onStartChange={(year) =>
              setDraft((currentDraft) => ({ ...currentDraft, startYear: year }))
            }
            onEndChange={(year) =>
              setDraft((currentDraft) => ({ ...currentDraft, endYear: year }))
            }
            onNicknameChange={(nickname) =>
              setDraft((currentDraft) => ({ ...currentDraft, nickname }))
            }
            onDescriptionChange={(description) =>
              setDraft((currentDraft) => ({ ...currentDraft, description }))
            }
            onClose={onClose}
            onDelete={
              era ? () => setShowDeleteModal(true) : undefined
            }
          />
          <EraFactsForm
            eraFacts={draft.eraFacts}
            incomeEarners={incomeEarners}
            eraNickname={draft.nickname}
            eraStartYear={draft.startYear}
            eraEndYear={draft.endYear}
            eraYears={draftEraYears}
            taxEstimatorRef={taxEstimatorRef}
            resolvedYearInputsForEra={resolvedYearInputsForEra}
            overrideFieldDescriptors={overrideFieldDescriptors}
            draftOverridesByField={draftOverridesByField}
            overrideSummariesByField={overrideSummariesByField}
            onSaveFieldOverrides={handleSaveFieldOverrides}
            onBulkApplyFilingStatus={onBulkApplyFilingStatus}
            onUpdateEraFacts={(updater) =>
              setDraft((currentDraft) => ({
                ...currentDraft,
                eraFacts: updater(currentDraft.eraFacts),
              }))
            }
          />
        </div>
      </div>

      <div
        className="shrink-0 border-t border-border-secondary bg-bg-primary shadow-[0px_-32px_5.3px_-28px_rgba(0,0,0,0.06),0px_4px_8px_-2px_rgba(0,0,0,0.1)]"
        style={{
          paddingLeft: 24,
          paddingRight: 24,
          paddingTop: "0.5em",
          paddingBottom: "0.5em",
          marginBottom: "0.5em",
        }}
      >
        <div className="flex items-center justify-between">
          <Button variant="quaternary" size="lg" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleSaveAndClose}
            disabled={!canSave || !hasChanges}
          >
            Update
          </Button>
        </div>
      </div>

      <EraDeleteModal
        isOpen={showDeleteModal}
        eraName={era?.nickname ?? ""}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </aside>
  );
});

export default EraDetailPane;
