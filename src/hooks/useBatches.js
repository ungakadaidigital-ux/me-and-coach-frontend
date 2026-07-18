import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api.js";

export function useBatches({ vertical } = {}) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (vertical) params.set("vertical", vertical);
      const data = await api.get(`/api/batches?${params}`);
      setBatches(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [vertical]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { batches, loading, error, refresh };
}

// days_of_week uses ISO convention: 1=Monday ... 7=Sunday
export function isBatchToday(batch, date = new Date()) {
  const isoDay = date.getDay() === 0 ? 7 : date.getDay();
  return batch.days_of_week.includes(isoDay);
}

