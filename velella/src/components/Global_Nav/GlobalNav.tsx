import { useState } from "react";
import {
  Button,
  TabBar,
  Text,
} from "../../../../../counterfoil-kit/src/index.ts";
import TaxReferenceDataModal from "../General/TaxReferenceDataModal";
import { useTaxReferenceData } from "../../hooks/useTaxReferenceData";
import type { ScenarioSummary } from "../../services/scenarioService";

export type TabId = "narrative" | "timeline" | "assumptions";

interface GlobalNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  scenarioTitle?: string;
  scenarios: ScenarioSummary[];
  selectedScenarioId: string | null;
  onScenarioChange: (id: string) => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "narrative", label: "Narrative" },
  { id: "timeline", label: "Timeline" },
  { id: "assumptions", label: "Assumptions" },
];

export default function GlobalNav({
  activeTab,
  onTabChange,
  scenarioTitle,
  scenarios,
  selectedScenarioId,
  onScenarioChange,
}: GlobalNavProps) {
  const [isTaxReferenceDataOpen, setIsTaxReferenceDataOpen] = useState(false);
  const {
    taxReferenceData,
    loading: taxReferenceDataLoading,
    error: taxReferenceDataError,
  } = useTaxReferenceData();
  const hasScenarios = scenarios.length > 0;
  const currentScenarioLabel =
    scenarios.find((s) => s.id === selectedScenarioId)?.label ?? "Scenario";

  return (
    <header
      className="shrink-0 w-full bg-bg-primary text-text-primary font-ui border-b border-border-primary flex items-center justify-between px-6 py-4"
      role="banner"
    >
      <div className="flex min-w-0 flex-row items-center gap-4">
        <div className="flex flex-col min-w-0">
          <Text
            size="body2"
            hierarchy="secondary"
            as="span"
            className="truncate"
          >
            Scenario
          </Text>
          <span
            className="text-body font-medium text-text-primary truncate"
            id="scenario-title"
          >
            {scenarioTitle?.trim() || currentScenarioLabel}
          </span>
        </div>
        {hasScenarios && (
          <label className="inline-flex items-center gap-2 min-w-0">
            <span className="sr-only">Choose scenario</span>
            <select
              value={selectedScenarioId ?? ""}
              onChange={(e) => {
                const nextId = e.target.value;
                if (nextId) {
                  onScenarioChange(nextId);
                }
              }}
              className="max-w-xs rounded border border-input-border bg-input-bg px-3 py-1.5 text-body-2 text-text-primary"
            >
              {scenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="tertiary"
          size="md"
          onClick={() => setIsTaxReferenceDataOpen(true)}
        >
          Tax Reference Data
        </Button>
        <nav aria-label="Main">
          <TabBar
            tabs={TABS}
            selectedId={activeTab}
            onSelect={(id) => onTabChange(id as TabId)}
            size="md"
          />
        </nav>
      </div>
      <TaxReferenceDataModal
        isOpen={isTaxReferenceDataOpen}
        onClose={() => setIsTaxReferenceDataOpen(false)}
        taxReferenceData={taxReferenceData}
        loading={taxReferenceDataLoading}
        error={taxReferenceDataError}
      />
    </header>
  );
}

