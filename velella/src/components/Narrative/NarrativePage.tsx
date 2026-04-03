import { useState, useCallback, useEffect, useRef } from "react";
import { Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import type { Era } from "../../types/era";
import { applyFilingStatusGlobally } from "../../lib/filingStatus";
import type { FilingStatus, Scenario } from "../../types/scenario";
import EraDetailPane, { type EraDetailPaneHandle } from "../General/EraDetailPane";
import EraUnsavedChangesModal from "../General/EraUnsavedChangesModal";
import ErasList from "./ErasList";

type NarrativePendingAfterUnsavedModal =
  | { type: "close" }
  | { type: "selectEra"; era: Era }
  | { type: "create" };

interface NarrativePageProps {
  scenario: Scenario | null;
  loading: boolean;
  onPersist: (scenario: Scenario) => Promise<void>;
}

export default function NarrativePage({
  scenario,
  loading,
  onPersist,
}: NarrativePageProps) {
  const [selectedEra, setSelectedEra] = useState<Era | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [localScenario, setLocalScenario] = useState<Scenario | null>(scenario);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingAfterUnsavedModal, setPendingAfterUnsavedModal] =
    useState<NarrativePendingAfterUnsavedModal | null>(null);
  const eraPaneRef = useRef<EraDetailPaneHandle | null>(null);

  useEffect(() => {
    setLocalScenario(scenario);
  }, [scenario]);

  useEffect(() => {
    if (!localScenario || !selectedEra) return;
    const fresh = localScenario.eras?.find((e) => e.id === selectedEra.id);
    if (fresh && fresh !== selectedEra) {
      setSelectedEra(fresh);
    }
  }, [localScenario, selectedEra]);

  const handleBulkApplyFilingStatus = useCallback(
    (status: FilingStatus) => {
      setLocalScenario((current) => {
        if (!current) return current;
        const updated = applyFilingStatusGlobally(current, status);
        void onPersist(updated);
        return updated;
      });
    },
    [onPersist]
  );

  const handleSave = useCallback(
    (updated: Scenario) => {
      setLocalScenario(updated);
      void onPersist(updated);
      if (selectedEra) {
        const era = updated.eras?.find((e) => e.id === selectedEra.id);
        setSelectedEra(era ?? null);
      }
    },
    [onPersist, selectedEra]
  );

  const closePane = useCallback(() => {
    setSelectedEra(null);
    setIsCreating(false);
  }, []);

  const requestClosePane = useCallback(() => {
    if (eraPaneRef.current?.hasUnsavedChanges()) {
      setPendingAfterUnsavedModal({ type: "close" });
      setShowUnsavedModal(true);
      return;
    }
    closePane();
  }, [closePane]);

  const requestSelectEra = useCallback(
    (era: Era) => {
      if (selectedEra?.id === era.id && !isCreating) {
        return;
      }
      const paneOpen = selectedEra !== null || isCreating;
      if (paneOpen && eraPaneRef.current?.hasUnsavedChanges()) {
        setPendingAfterUnsavedModal({ type: "selectEra", era });
        setShowUnsavedModal(true);
        return;
      }
      setSelectedEra(era);
      setIsCreating(false);
    },
    [isCreating, selectedEra]
  );

  const requestCreateEra = useCallback(() => {
    const paneOpen = selectedEra !== null || isCreating;
    if (paneOpen && eraPaneRef.current?.hasUnsavedChanges()) {
      setPendingAfterUnsavedModal({ type: "create" });
      setShowUnsavedModal(true);
      return;
    }
    setSelectedEra(null);
    setIsCreating(true);
  }, [isCreating, selectedEra]);

  const handleUnsavedModalSave = useCallback(() => {
    const didSave = eraPaneRef.current?.saveDraft() ?? false;
    if (!didSave) {
      return;
    }
    setShowUnsavedModal(false);
    const pending = pendingAfterUnsavedModal;
    setPendingAfterUnsavedModal(null);
    if (!pending) {
      return;
    }
    if (pending.type === "close") {
      closePane();
    } else if (pending.type === "selectEra") {
      setSelectedEra(pending.era);
      setIsCreating(false);
    } else {
      setSelectedEra(null);
      setIsCreating(true);
    }
  }, [closePane, pendingAfterUnsavedModal]);

  const handleUnsavedModalDiscard = useCallback(() => {
    setShowUnsavedModal(false);
    const pending = pendingAfterUnsavedModal;
    setPendingAfterUnsavedModal(null);
    if (!pending) {
      return;
    }
    if (pending.type === "close") {
      closePane();
    } else if (pending.type === "selectEra") {
      setSelectedEra(pending.era);
      setIsCreating(false);
    } else {
      setSelectedEra(null);
      setIsCreating(true);
    }
  }, [closePane, pendingAfterUnsavedModal]);

  const isPaneOpen = selectedEra !== null || isCreating;

  if (loading) {
    return (
      <Text size="body1" hierarchy="secondary">
        Loading…
      </Text>
    );
  }

  if (!localScenario) {
    return null;
  }

  const eras = localScenario.eras ?? [];

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <Stack gap="lg">
          <Text size="h2" hierarchy="primary">
            Narrative
          </Text>
          <ErasList
            eras={eras}
            onCreateEra={requestCreateEra}
            onSelectEra={requestSelectEra}
          />
        </Stack>
      </div>
      {isPaneOpen && (
        <EraDetailPane
          ref={eraPaneRef}
          key={selectedEra?.id ?? "new-era"}
          scenario={localScenario}
          era={selectedEra}
          onClose={requestClosePane}
          onSave={handleSave}
          onBulkApplyFilingStatus={handleBulkApplyFilingStatus}
        />
      )}
      <EraUnsavedChangesModal
        isOpen={showUnsavedModal}
        onSave={handleUnsavedModalSave}
        onDiscard={handleUnsavedModalDiscard}
      />
    </div>
  );
}
