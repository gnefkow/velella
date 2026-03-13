import { useEffect, useState, useCallback } from "react";
import {
  loadScenarioManifest,
  type ScenarioSummary,
} from "../services/scenarioService";

const LOCAL_STORAGE_KEY = "velella.selectedScenarioId";

export interface UseScenarioSelectionResult {
  scenarios: ScenarioSummary[];
  selectedScenarioId: string | null;
  loading: boolean;
  error: string | null;
  selectScenario: (id: string) => void;
}

export function useScenarioSelection(): UseScenarioSelectionResult {
  const [scenarios, setScenarios] = useState<ScenarioSummary[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const manifest = await loadScenarioManifest();
        if (!isMounted) return;
        setScenarios(manifest);

        const storedId =
          typeof window !== "undefined"
            ? window.localStorage.getItem(LOCAL_STORAGE_KEY)
            : null;

        const initialId =
          (storedId && manifest.some((m) => m.id === storedId)
            ? storedId
            : manifest[0]?.id) ?? null;

        setSelectedScenarioId(initialId);
      } catch (e) {
        if (!isMounted) return;
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectScenario = useCallback((id: string) => {
    setSelectedScenarioId(id);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, id);
    }
  }, []);

  return {
    scenarios,
    selectedScenarioId,
    loading,
    error,
    selectScenario,
  };
}

