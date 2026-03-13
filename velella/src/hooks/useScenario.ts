import { useState, useEffect, useCallback } from "react";
import type { Scenario } from "../types/scenario";
import { loadScenario, saveScenario } from "../services/scenarioService";

interface UseScenarioOptions {
  scenarioId?: string | null;
}

export function useScenario(options?: UseScenarioOptions) {
  const scenarioId = options?.scenarioId ?? undefined;

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadScenario(scenarioId);
      setScenario(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [scenarioId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    async (updated: Scenario) => {
      setScenario(updated);
      setError(null);
      try {
        await saveScenario(updated, scenarioId);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        throw e;
      }
    },
    [scenarioId]
  );

  const persist = useCallback(
    async (updated: Scenario) => {
      setError(null);
      try {
        await saveScenario(updated, scenarioId);
        setScenario(updated);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        throw e;
      }
    },
    [scenarioId]
  );

  return { scenario, loading, error, save, persist, refresh };
}

