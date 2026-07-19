import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api.js";
import { enqueue, getQueuedForBatch, removeFromQueue } from "../lib/offlineQueue.js";

export function useAttendance(batchId) {
  const [marks, setMarks] = useState({});
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const flushingRef = useRef(false);
  const debounceRef = useRef(null);

  const refreshPendingCount = useCallback(async () => {
    const queued = await getQueuedForBatch(batchId);
    setPendingCount(queued.length);
    return queued;
  }, [batchId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const queued = await getQueuedForBatch(batchId);
      if (cancelled) return;
      if (queued.length > 0) {
        setMarks((m) => {
          const next = { ...m };
          for (const item of queued) next[item.student_id] = item.status;
          return next;
        });
        setPendingCount(queued.length);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [batchId]);

  const flush = useCallback(async () => {
    if (flushingRef.current) return;
    const queued = await getQueuedForBatch(batchId);
    if (queued.length === 0) return;

    flushingRef.current = true;
    setSyncing(true);
    setSyncError(null);
    try {
      await api.post(
        "/api/attendance/bulk",
        queued.map(({ id, batch_id, student_id, status, device_marked_at }) => ({
          id,
          batch_id,
          student_id,
          status,
          device_marked_at,
        }))
      );
      await removeFromQueue(queued.map((item) => item.id));
      await refreshPendingCount();
    } catch (e) {
      setSyncError(e.message);
    } finally {
      setSyncing(false);
      flushingRef.current = false;
    }
  }, [batchId, refreshPendingCount]);

  useEffect(() => {
    const handleOnline = () => flush();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [flush]);

  const mark = useCallback(
    async (studentId, status) => {
      setMarks((m) => ({ ...m, [studentId]: status }));
      await enqueue({
        id: crypto.randomUUID(),
        batch_id: batchId,
        student_id: studentId,
        status,
        device_marked_at: new Date().toISOString(),
      });
      await refreshPendingCount();
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(flush, 1000);
    },
    [batchId, flush, refreshPendingCount]
  );

  return { marks, mark, pendingCount, syncing, syncError, retrySync: flush };
}
