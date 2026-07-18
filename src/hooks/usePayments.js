import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api.js";

export function usePayments({ status } = {}) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sentIds, setSentIds] = useState({});

  const refresh = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    const data = await api.get(`/api/payments?${params}`);
    setPayments(data);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const sendReminder = useCallback(async (paymentId) => {
    const result = await api.post(`/api/payments/${paymentId}/send-reminder`, {});
    if (result.sent) setSentIds((m) => ({ ...m, [paymentId]: true }));
    return result;
  }, []);

  const markPaid = useCallback(
    async (paymentId, method) => {
      await api.post(`/api/payments/${paymentId}/mark-paid`, { method });
      await refresh();
    },
    [refresh]
  );

  return { payments, loading, sentIds, sendReminder, markPaid, refresh };
}

