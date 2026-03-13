import { useState, useCallback, useEffect } from "react";
import { Stack, Text } from "../../../../../counterfoil-kit/src/index.ts";
import type { Era } from "../../types/era";
import type { Scenario } from "../../types/scenario";
import ErasList from "./ErasList";
import EraDetailPane from "./EraDetailPane";

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

  useEffect(() => {
    setLocalScenario(scenario);
  }, [scenario]);

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

  const handleCreateEra = useCallback(() => {
    setSelectedEra(null);
    setIsCreating(true);
  }, []);

  const handleSelectEra = useCallback((era: Era) => {
    setSelectedEra(era);
    setIsCreating(false);
  }, []);

  const handleClosePane = useCallback(() => {
    setSelectedEra(null);
    setIsCreating(false);
  }, []);

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
    <div className="flex min-h-0 flex-1 w-full min-w-0 overflow-hidden">
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <Stack gap="lg">
          <Text size="h2" hierarchy="primary">
            Narrative
          </Text>
          <ErasList
            eras={eras}
            onCreateEra={handleCreateEra}
            onSelectEra={handleSelectEra}
          />
        </Stack>
      </div>
      {isPaneOpen && (
        <EraDetailPane
          scenario={localScenario}
          era={selectedEra}
          onClose={handleClosePane}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
