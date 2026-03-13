import { useState, useCallback, useMemo } from "react";
import { Button, Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import { X, Trash2 } from "lucide-react";
import type { Era } from "../../types/era";
import type { Scenario } from "../../types/scenario";
import { buildDefaultEraFacts } from "../../lib/eraFacts";
import { getYearDropdownOptions } from "../../lib/eraHelpers";
import { createEra, updateEra, deleteEra } from "../../services/eraService";
import EraRangeFields from "./EraRangeFields";
import EraNarrativeFields from "./EraNarrativeFields";
import EraFactsForm from "./EraFactsForm";
import EraUnsavedChangesModal from "./EraUnsavedChangesModal";
import EraDeleteModal from "./EraDeleteModal";

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
  onClose: () => void;
  onSave: (scenario: Scenario) => void;
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

export default function EraDetailPane({
  scenario,
  era,
  onClose,
  onSave,
}: EraDetailPaneProps) {
  const [draft, setDraft] = useState<EraDraft>(() =>
    buildInitialDraft(scenario, era)
  );
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const hasChanges = useMemo(() => {
    if (!era) {
      return (
        draft.nickname.trim() !== "" ||
        draft.description.trim() !== "" ||
        draft.startYear !== null ||
        draft.endYear !== null
      );
    }
    return (
      draft.nickname !== era.nickname ||
      draft.description !== era.description ||
      draft.startYear !== era.startYear ||
      draft.endYear !== era.endYear ||
      JSON.stringify(draft.eraFacts) !== JSON.stringify(era.eraFacts)
    );
  }, [draft, era]);

  const canSave = useMemo(() => {
    if (!draft.nickname.trim()) return false;
    if (draft.startYear === null || draft.endYear === null) return false;
    if (draft.startYear > draft.endYear) return false;
    return true;
  }, [draft]);

  const incomeEarners = useMemo(
    () => scenario.householdMembers.filter((m) => m.incomeEarner),
    [scenario.householdMembers]
  );

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

  const handleSave = useCallback(() => {
    if (!canSave) return;

    try {
      const updated =
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
      onSave(updated);
      onClose();
    } catch (err) {
      console.error("Failed to save era:", err);
    }
  }, [canSave, draft, era, scenario, onSave, onClose]);

  const handleClose = useCallback(() => {
    if (hasChanges) {
      setShowUnsavedModal(true);
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);

  const handleDiscard = useCallback(() => {
    setShowUnsavedModal(false);
    onClose();
  }, [onClose]);

  const handleDelete = useCallback(() => {
    if (!era) return;
    const updated = deleteEra(scenario, era.id);
    onSave(updated);
    setShowDeleteModal(false);
    onClose();
  }, [era, scenario, onSave, onClose]);

  return (
    <aside className="flex h-full min-h-0 w-[22em] shrink-0 flex-col border-l border-border-secondary bg-bg-primary overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-border-secondary p-2">
        <Button
          variant="tertiary"
          size="md"
          icon={<X size={20} />}
          aria-label="Close"
          onClick={handleClose}
        />
        {era && (
          <Button
            variant="tertiary"
            size="md"
            icon={<Trash2 size={20} />}
            aria-label="Delete era"
            onClick={() => setShowDeleteModal(true)}
          />
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
        <Stack gap="lg">
          <EraNarrativeFields
            nickname={draft.nickname}
            description={draft.description}
            onNicknameChange={(v) =>
              setDraft((d) => ({ ...d, nickname: v }))
            }
            onDescriptionChange={(v) =>
              setDraft((d) => ({ ...d, description: v }))
            }
          />
          <EraRangeFields
            startYear={draft.startYear}
            endYear={draft.endYear}
            startOptions={startOptions}
            endOptions={endOptions}
            onStartChange={(y) =>
              setDraft((d) => ({ ...d, startYear: y }))
            }
            onEndChange={(y) =>
              setDraft((d) => ({ ...d, endYear: y }))
            }
          />
          <EraFactsForm
            eraFacts={draft.eraFacts}
            incomeEarners={incomeEarners}
            onUpdateEraFacts={(updater) =>
              setDraft((d) => ({ ...d, eraFacts: updater(d.eraFacts) }))
            }
          />
        </Stack>
      </div>

      <div className="shrink-0 border-t border-border-secondary p-4">
        <Button
          variant="primary"
          size="md"
          onClick={handleSave}
          disabled={!canSave || !hasChanges}
        >
          Save
        </Button>
      </div>

      <EraUnsavedChangesModal
        isOpen={showUnsavedModal}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
      <EraDeleteModal
        isOpen={showDeleteModal}
        eraName={era?.nickname ?? ""}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </aside>
  );
}
