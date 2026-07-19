import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api.js";
import { enqueue, getQueuedForBatch, removeFromQueue } from "../lib/offlineQueue.js";

/**
 * Attendance sync queue, persisted to IndexedDB.
 *
 * Every mark is written to IndexedDB the instant it happens — not
 * just held in a JS ref — so it survives the app being killed or
 * reloaded while offline. On mount, any marks queued earlier for
 * this batch are read back so the UI reflects "still pending sync"
 * correctly instead of looking like they were never marked.
 *
 * flush() is called: on a 1s debounce after each mark, immediately
 * when the browser regains connectivity, and on manual retry.
 */
export function useAttendance(batchId) {
  const [marks, setMarks] = useState({}); // student_id -> 'present' | 'absent'
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

  // Rehydrate on mount / batch change: restore marks + pending count
  // from whatever is still sitting in IndexedDB from a previous
  // offline session.
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
      // Items stay in IndexedDB — nothing to roll back, next flush
      // (on reconnect, next mark, or manual retry) will retry them.
      setSyncError(e.message);
    } finally {
      setSyncing(false);
      flushingRef.current = false;
    }
  }, [batchId, refreshPendingCount]);

  // Auto-retry the moment the browser comes back online — don't
  // wait for the coach to mark another student or hit retry.
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
