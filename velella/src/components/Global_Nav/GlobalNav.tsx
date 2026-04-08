import { MoreHorizontal } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TabBar } from "../../../../../counterfoil-kit/src/index.ts";
import TaxReferenceDataModal from "../General/TaxReferenceDataModal";
import { useTaxReferenceData } from "../../hooks/useTaxReferenceData";
import type { ScenarioSummary } from "../../services/scenarioService";
import TertiaryNativeSelect, {
  getTertiaryNativeSelectShellClassName,
  tertiaryNativeSelectTriggerInnerClassName,
} from "../ui/TertiaryNativeSelect";

export type TabId = "narrative" | "timeline" | "assumptions";

interface GlobalNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  scenarios: ScenarioSummary[];
  selectedScenarioId: string | null;
  onScenarioChange: (id: string) => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "assumptions", label: "Scenario" },
  { id: "narrative", label: "Narrative" },
  { id: "timeline", label: "Timeline" },
];

export default function GlobalNav({
  activeTab,
  onTabChange,
  scenarios,
  selectedScenarioId,
  onScenarioChange,
}: GlobalNavProps) {
  const [isTaxReferenceDataOpen, setIsTaxReferenceDataOpen] = useState(false);
  const [isTaxMenuOpen, setIsTaxMenuOpen] = useState(false);
  const taxMenuRef = useRef<HTMLDivElement | null>(null);
  const {
    taxReferenceData,
    loading: taxReferenceDataLoading,
    error: taxReferenceDataError,
  } = useTaxReferenceData();
  const hasScenarios = scenarios.length > 0;

  useEffect(() => {
    if (!isTaxMenuOpen) {
      return;
    }

    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (taxMenuRef.current?.contains(target)) {
        return;
      }
      setIsTaxMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTaxMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isTaxMenuOpen]);

  return (
    <header
      className="shrink-0 w-full bg-bg-primary text-text-primary font-ui border-b border-border-primary flex items-center justify-between px-6 py-4"
      role="banner"
    >
      <div className="flex min-w-0 flex-row items-center gap-4">
        {hasScenarios ? (
          <TertiaryNativeSelect
            ariaLabel="Scenario"
            placeholder="Choose scenario"
            value={selectedScenarioId}
            options={scenarios.map((s) => ({
              value: s.id,
              label: s.label,
            }))}
            onValueChange={onScenarioChange}
            className="max-w-xs min-w-0"
            labelClassName="min-w-0 truncate"
          />
        ) : null}
      </div>
      <div className="flex items-center gap-3">
        <nav aria-label="Main">
          <TabBar
            tabs={TABS}
            selectedId={activeTab}
            onSelect={(id) => onTabChange(id as TabId)}
            size="md"
          />
        </nav>
        <div ref={taxMenuRef} className="relative">
          {/* UA `<button>` chrome: see JSDoc on `getTertiaryNativeSelectShellClassName` in TertiaryNativeSelect.tsx */}
          <button
            type="button"
            className={getTertiaryNativeSelectShellClassName({
              variant: "menu-trigger",
              className: [
                "!min-w-0 cursor-pointer appearance-none border-0 p-0 shadow-none",
                "[-webkit-tap-highlight-color:transparent]",
                "[&::-moz-focus-inner]:border-0 [&::-moz-focus-inner]:p-0",
                "outline-none focus:outline-none",
                !isTaxMenuOpen ? "focus:ring-0 focus:ring-offset-0" : "",
                "focus-visible:ring-2 focus-visible:ring-button-tertiary focus-visible:ring-offset-2",
                isTaxMenuOpen
                  ? "ring-2 ring-button-tertiary ring-offset-2"
                  : "ring-0 ring-offset-0",
              ]
                .filter(Boolean)
                .join(" "),
            })}
            aria-expanded={isTaxMenuOpen}
            aria-haspopup="menu"
            aria-label="More options"
            onClick={() => setIsTaxMenuOpen((open) => !open)}
          >
            <span className={tertiaryNativeSelectTriggerInnerClassName}>
              <MoreHorizontal
                size={18}
                aria-hidden="true"
                className="shrink-0 text-current"
              />
            </span>
          </button>
          {isTaxMenuOpen ? (
            <div
              className="absolute right-0 top-[calc(100%+0.5rem)] z-20 min-w-[10rem] rounded-md border border-border-secondary bg-bg-primary p-1 shadow-md"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                className="w-full rounded-md px-3 py-2 text-left text-body-2 text-text-primary transition-colors hover:bg-bg-primary-hover"
                onClick={() => {
                  setIsTaxMenuOpen(false);
                  setIsTaxReferenceDataOpen(true);
                }}
              >
                Tax Reference Data
              </button>
            </div>
          ) : null}
        </div>
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

