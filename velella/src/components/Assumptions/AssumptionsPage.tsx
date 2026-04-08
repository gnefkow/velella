import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { Text } from "../../../../../counterfoil-kit/src/index.ts";
import { useAssumptionsEditor } from "../../hooks/useAssumptionsEditor";
import { scenariosDeepEqual } from "../../lib/scenariosDeepEqual";
import type { Scenario } from "../../types/scenario";
import AssumptionsForm from "./AssumptionsForm";
import AssumptionsSummaryBlock from "./AssumptionsSummaryBlock";

export type AssumptionsPageHandle = {
  isDirty: () => boolean;
  saveDraft: () => Promise<void>;
  revertDraft: () => void;
};

interface AssumptionsPageProps {
  scenario: Scenario | null;
  loading: boolean;
  error: string | null;
  onSave: (scenario: Scenario) => Promise<void>;
}

const AssumptionsPageWithEditor = forwardRef<
  AssumptionsPageHandle,
  { saved: Scenario; onSave: (scenario: Scenario) => Promise<void> }
>(function AssumptionsPageWithEditor({ saved, onSave }, ref) {
  const {
    scenario,
    updateScenarioInfo,
    updateAssumptions,
    addHouseholdMember,
    updateHouseholdMember,
    deleteHouseholdMember,
    handleSave,
    handleRevert,
    saving,
  } = useAssumptionsEditor(saved, onSave);

  const scenarioRef = useRef(scenario);
  const savedRef = useRef(saved);
  const saveRef = useRef(handleSave);
  const revertRef = useRef(handleRevert);

  useEffect(() => {
    scenarioRef.current = scenario;
  }, [scenario]);

  useEffect(() => {
    savedRef.current = saved;
  }, [saved]);

  useEffect(() => {
    saveRef.current = handleSave;
  }, [handleSave]);

  useEffect(() => {
    revertRef.current = handleRevert;
  }, [handleRevert]);

  useImperativeHandle(
    ref,
    () => ({
      isDirty: () =>
        !scenariosDeepEqual(scenarioRef.current, savedRef.current),
      saveDraft: () => saveRef.current(),
      revertDraft: () => revertRef.current(),
    }),
    []
  );

  return (
    <div className="flex w-full min-h-full justify-center gap-[1em] bg-bg-primary">
      <div className="flex w-[512px] max-w-full shrink-0 flex-col min-h-full bg-bg-primary px-6 py-4">
        <div className="flex min-h-0 min-w-0 w-full max-w-full flex-1 flex-col">
          <AssumptionsForm
            scenario={scenario}
            updateScenarioInfo={updateScenarioInfo}
            updateAssumptions={updateAssumptions}
            addHouseholdMember={addHouseholdMember}
            updateHouseholdMember={updateHouseholdMember}
            deleteHouseholdMember={deleteHouseholdMember}
          />
        </div>
      </div>
      <AssumptionsSummaryBlock
        scenario={scenario}
        onRevert={handleRevert}
        onSave={() => {
          void handleSave();
        }}
        saving={saving}
      />
    </div>
  );
});

const AssumptionsPage = forwardRef<AssumptionsPageHandle, AssumptionsPageProps>(
  function AssumptionsPage({ scenario, loading, error, onSave }, ref) {
    if (loading) {
      return (
        <Text size="body1" hierarchy="secondary">
          Loading…
        </Text>
      );
    }

    if (error) {
      return (
        <Text size="body1" hierarchy="primary">
          Error: {error}
        </Text>
      );
    }

    if (!scenario) {
      return null;
    }

    return (
      <AssumptionsPageWithEditor ref={ref} saved={scenario} onSave={onSave} />
    );
  }
);

export default AssumptionsPage;
