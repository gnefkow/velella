import { useCallback, useEffect, useState } from "react";
import { loadTaxReferenceData } from "../services/taxReferenceDataService";
import type { TaxReferenceData } from "../types/taxReferenceData";

export function useTaxReferenceData() {
  const [taxReferenceData, setTaxReferenceData] = useState<TaxReferenceData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const nextData = await loadTaxReferenceData();
      setTaxReferenceData(nextData);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    taxReferenceData,
    loading,
    error,
    refresh,
  };
}
