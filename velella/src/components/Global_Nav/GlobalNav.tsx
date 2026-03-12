import { TabBar } from "../../../../../counterfoil-kit/src/index.ts";

export type TabId = "narrative" | "timeline" | "assumptions";

interface GlobalNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  scenarioTitle?: string;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "narrative", label: "Narrative" },
  { id: "timeline", label: "Timeline" },
  { id: "assumptions", label: "Assumptions" },
];

export default function GlobalNav({ activeTab, onTabChange, scenarioTitle }: GlobalNavProps) {
  return (
    <header
      className="shrink-0 w-full bg-bg-primary text-text-primary font-ui border-b border-border-primary flex items-center justify-between px-6 py-4"
      role="banner"
    >
      <span className="text-body font-medium text-text-primary" id="scenario-title">
        {scenarioTitle?.trim() || "Scenario"}
      </span>
      <nav aria-label="Main">
        <TabBar
          tabs={TABS}
          selectedId={activeTab}
          onSelect={(id) => onTabChange(id as TabId)}
          size="md"
        />
      </nav>
    </header>
  );
}
