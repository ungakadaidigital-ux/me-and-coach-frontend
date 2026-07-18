import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api.js";

export function useStudents({ vertical, batchId } = {}) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (vertical) params.set("vertical", vertical);
      if (batchId) params.set("batch_id", batchId);
      const data = await api.get(`/api/students?${params}`);
      setStudents(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [vertical, batchId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { students, loading, error, refresh };
}

