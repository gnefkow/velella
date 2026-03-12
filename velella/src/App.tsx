import { useState } from "react";
import GlobalNav, { type TabId } from "./components/Global_Nav/GlobalNav";
import NarrativePage from "./components/Narrative/NarrativePage";
import TimelinePage from "./components/Timeline/TimelinePage";
import AssumptionsPage from "./components/Assumptions/AssumptionsPage";
import { useScenario } from "./hooks/useScenario";

function AppContent() {
  const [activeTab, setActiveTab] = useState<TabId>("narrative");
  const { scenario, loading, error, save, persist } = useScenario();

  return (
    <div className="flex h-screen min-h-0 flex-col overflow-hidden">
      <GlobalNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        scenarioTitle={scenario?.scenarioInfo.scenarioTitle}
      />
      <main
        className={`flex-1 min-h-0 p-6 bg-bg-primary text-text-primary font-ui flex flex-col ${
          activeTab === "timeline" ? "overflow-hidden" : "overflow-y-auto"
        }`}
        role="main"
      >
        {activeTab === "narrative" && <NarrativePage />}
        {activeTab === "timeline" && (
          <TimelinePage
            scenario={scenario}
            loading={loading}
            onPersist={persist}
          />
        )}
        {activeTab === "assumptions" && (
          <AssumptionsPage
            scenario={scenario}
            loading={loading}
            error={error}
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
