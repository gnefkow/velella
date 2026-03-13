import { useState, useEffect } from "react";
import GlobalNav, { type TabId } from "./components/Global_Nav/GlobalNav";
import NarrativePage from "./components/Narrative/NarrativePage";
import TimelinePage from "./components/Timeline/TimelinePage";
import AssumptionsPage from "./components/Assumptions/AssumptionsPage";
import { useScenario } from "./hooks/useScenario";
import { useScenarioSelection } from "./hooks/useScenarioSelection";

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

  useEffect(() => {
    // When the selected scenario changes, reload scenario data.
    if (effectiveScenarioId) {
      void refresh();
    }
  }, [effectiveScenarioId, refresh]);

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden">
      <GlobalNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        scenarioTitle={scenario?.scenarioInfo.scenarioTitle}
        scenarios={scenarios}
        selectedScenarioId={effectiveScenarioId ?? null}
        onScenarioChange={selectScenario}
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
            scenario={scenario}
            loading={loading || scenariosLoading}
            error={error ?? scenariosError ?? null}
            onSave={save}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <div className="h-screen min-h-0 w-full overflow-hidden bg-bg-primary text-text-primary font-ui">
      <AppContent />
    </div>
  );
}
