import { useState, useEffect, useRef } from "react";
import GlobalNav, { type TabId } from "./components/Global_Nav/GlobalNav";
import NarrativePage from "./components/Narrative/NarrativePage";
import TimelinePage from "./components/Timeline/TimelinePage";
import AssumptionsPage, {
  type AssumptionsPageHandle,
} from "./components/Assumptions/AssumptionsPage";
import ScenarioDetailsExitModal from "./components/Assumptions/ScenarioDetailsExitModal";
import { useScenario } from "./hooks/useScenario";
import { useScenarioSelection } from "./hooks/useScenarioSelection";

type PendingAssumptionsNav =
  | { type: "tab"; tab: TabId }
  | { type: "scenario"; id: string };

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>("narrative");
  const {
    scenarios,
    selectedScenarioId,
    loading: scenariosLoading,
    error: scenariosError,
    selectScenario,
  } = useScenarioSelection();

  const effectiveScenarioId =
    selectedScenarioId ?? (scenarios.length > 0 ? scenarios[0].id : undefined);

  const { scenario, loading, error, save, persist, refresh } = useScenario({
    scenarioId: effectiveScenarioId,
  });

  const assumptionsRef = useRef<AssumptionsPageHandle | null>(null);
  const [scenarioExitModalOpen, setScenarioExitModalOpen] = useState(false);
  const [pendingAssumptionsNav, setPendingAssumptionsNav] =
    useState<PendingAssumptionsNav | null>(null);

  const currentScenarioId =
    selectedScenarioId ?? (scenarios.length > 0 ? scenarios[0]?.id : null);

  useEffect(() => {
    if (effectiveScenarioId) {
      void refresh();
    }
  }, [effectiveScenarioId, refresh]);

  const requestTabChange = (tab: TabId) => {
    if (
      activeTab === "assumptions" &&
      tab !== "assumptions" &&
      assumptionsRef.current?.isDirty()
    ) {
      setPendingAssumptionsNav({ type: "tab", tab });
      setScenarioExitModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const requestScenarioChange = (id: string) => {
    if (
      activeTab === "assumptions" &&
      currentScenarioId !== null &&
      id !== currentScenarioId &&
      assumptionsRef.current?.isDirty()
    ) {
      setPendingAssumptionsNav({ type: "scenario", id });
      setScenarioExitModalOpen(true);
      return;
    }
    selectScenario(id);
  };

  const handleScenarioExitSaveAndLeave = async () => {
    const pending = pendingAssumptionsNav;
    if (!pending) {
      return;
    }
    try {
      await assumptionsRef.current?.saveDraft();
    } catch {
      return;
    }
    if (pending.type === "tab") {
      setActiveTab(pending.tab);
    } else {
      selectScenario(pending.id);
    }
    setScenarioExitModalOpen(false);
    setPendingAssumptionsNav(null);
  };

  const handleScenarioExitDiscardAndLeave = () => {
    const pending = pendingAssumptionsNav;
    if (!pending) {
      return;
    }
    assumptionsRef.current?.revertDraft();
    if (pending.type === "tab") {
      setActiveTab(pending.tab);
    } else {
      selectScenario(pending.id);
    }
    setScenarioExitModalOpen(false);
    setPendingAssumptionsNav(null);
  };

  const handleScenarioExitCancel = () => {
    setScenarioExitModalOpen(false);
    setPendingAssumptionsNav(null);
  };

  return (
    <>
      <div className="flex h-screen min-h-0 flex-col overflow-hidden">
        <GlobalNav
          activeTab={activeTab}
          onTabChange={requestTabChange}
          scenarios={scenarios}
          selectedScenarioId={effectiveScenarioId ?? null}
          onScenarioChange={requestScenarioChange}
        />
        <main
          className={`flex-1 min-h-0 p-6 bg-bg-primary text-text-primary font-ui flex flex-col ${
            activeTab === "timeline" ? "overflow-hidden" : "overflow-y-auto"
          }`}
          role="main"
        >
          {activeTab === "narrative" && (
            <NarrativePage
              scenario={scenario}
              loading={loading || scenariosLoading}
              onPersist={persist}
            />
          )}
          {activeTab === "timeline" && (
            <TimelinePage
              scenario={scenario}
              loading={loading || scenariosLoading}
              onPersist={persist}
            />
          )}
          {activeTab === "assumptions" && (
            <AssumptionsPage
              ref={assumptionsRef}
              scenario={scenario}
              loading={loading || scenariosLoading}
              error={error ?? scenariosError ?? null}
              onSave={save}
            />
          )}
        </main>
      </div>
      <ScenarioDetailsExitModal
        isOpen={scenarioExitModalOpen}
        onSaveAndLeave={handleScenarioExitSaveAndLeave}
        onDiscardAndLeave={handleScenarioExitDiscardAndLeave}
        onCancel={handleScenarioExitCancel}
      />
    </>
  );
}

export default function App() {
  return (
    <div className="h-screen min-h-0 w-full overflow-hidden bg-bg-primary text-text-primary font-ui">
      <AppContent />
    </div>
  );
}
