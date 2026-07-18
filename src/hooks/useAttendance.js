import { useCallback, useRef, useState } from "react";
import { api } from "../lib/api.js";

/**
 * MVP sync queue: in-memory only. True offline support (surviving
 * an app kill/reload while offline) needs a persisted queue —
 * SQLite on mobile, IndexedDB on web — noted as a follow-up, not
 * built here. This covers "flaky network, app stays open."
 */
export function useAttendance(batchId) {
  const [marks, setMarks] = useState({}); // student_id -> 'present' | 'absent'
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const queueRef = useRef([]);
  const debounceRef = useRef(null);

  const flush = useCallback(async () => {
    if (queueRef.current.length === 0) return;
    const batch = queueRef.current;
    queueRef.current = [];
    setSyncing(true);
    setSyncError(null);
    try {
      await api.post("/api/attendance/bulk", batch);
    } catch (e) {
      setSyncError(e.message);
      queueRef.current = [...batch, ...queueRef.current]; // retry on next mark or manual retry
    } finally {
      setSyncing(false);
    }
  }, []);

  const mark = useCallback(
    (studentId, status) => {
      setMarks((m) => ({ ...m, [studentId]: status }));
      queueRef.current.push({
        id: crypto.randomUUID(),
        batch_id: batchId,
        student_id: studentId,
        status,
        device_marked_at: new Date().toISOString(),
      });
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(flush, 1000);
    },
    [batchId, flush]
  );

  return { marks, mark, syncing, syncError, retrySync: flush };
}

