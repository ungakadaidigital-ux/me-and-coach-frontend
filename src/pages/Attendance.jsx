import React, { useEffect, useState, useCallback } from "react";
import { Check, X, Wifi, WifiOff, CalendarX } from "lucide-react";
import TopBar from "../components/TopBar";
import EmptyState from "../components/EmptyState";
import { VERTICALS } from "../components/VTag";
import { api } from "../lib/api";
import { queueAttendance, flushQueue, queueLength } from "../lib/offlineQueue";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function Attendance() {
  const [batches, setBatches] = useState([]);
  const [batchId, setBatchId] = useState(null);
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState({});
  const [online, setOnline] = useState(navigator.onLine);
  const [pending, setPending] = useState(queueLength());

  useEffect(() => {
    api.batches().then((r) => {
      setBatches(r.batches || []);
      if (r.batches?.[0]) setBatchId(r.batches[0].id);
    });
  }, []);

  useEffect(() => {
    if (!batchId) return;
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;
    api.students({ vertical: batch.vertical }).then((r) => setStudents(r.students || []));
    setMarks({});
  }, [batchId, batches]);

  const trySync = useCallback(async () => {
    if (!navigator.onLine || queueLength() === 0) return;
    try {
      await flushQueue();
      setPending(0);
    } catch {
      // stays queued, will retry on next mark or reconnect
    }
  }, []);

  useEffect(() => {
    const goOnline = () => { setOnline(true); trySync(); };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, [trySync]);

  const mark = (studentId, status) => {
    setMarks((m) => ({ ...m, [studentId]: status }));
    queueAttendance({
      id: crypto.randomUUID(),
      batch_id: batchId,
      student_id: studentId,
      session_date: todayISO(),
      status,
      device_marked_at: new Date().toISOString(),
    });
    setPending(queueLength());
    trySync();
  };

  const batch = batches.find((b) => b.id === batchId);
  const presentCount = Object.values(marks).filter((v) => v === "present").length;

  return (
    <div>
      <TopBar title="வருகை" titleEn="Attendance" />
      <div className="px-4 pt-3 pb-2">
        {batches.length === 0 ? (
          <EmptyState icon={CalendarX} title="இன்னும் batch இல்லை" subtitle="முதலில் Schedule tab-ல் batch சேருங்கள்" />
        ) : (
          <>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {batches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setBatchId(b.id)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap shrink-0"
                  style={
                    b.id === batchId
                      ? { background: VERTICALS[b.vertical]?.color, color: "#fff" }
                      : { background: "#fff", color: "#5B6478", border: "1px solid #E7E0D2" }
                  }
                >
                  {b.start_time?.slice(0, 5)} · {VERTICALS[b.vertical]?.ta}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-xl p-3 mb-2 bg-ink">
              <div>
                <div className="text-white text-sm font-semibold">{batch?.name}</div>
                <div className="text-xs text-white/60">{presentCount}/{students.length} வந்திருக்காங்க</div>
              </div>
              <div
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={pending > 0 ? { background: "#3A3220", color: "#F2A93B" } : { background: "#E5F3EA", color: "#2E7D4F" }}
              >
                {online ? <Wifi size={12} /> : <WifiOff size={12} />}
                {pending > 0 ? `${pending} ஆஃப்லைனில் நிலுவை` : "ஒத்திசைவு முடிந்தது"}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="px-4 space-y-2 pb-6">
        {students.map((s) => {
          const state = marks[s.id];
          return (
            <div key={s.id} className="flex items-center gap-3 rounded-xl p-2.5 bg-white border border-line">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: VERTICALS[s.vertical]?.soft, color: VERTICALS[s.vertical]?.color }}>
                {s.name[0]}
              </div>
              <div className="flex-1 text-sm font-semibold text-ink">{s.name}</div>
              <button
                onClick={() => mark(s.id, "absent")}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={state === "absent" ? { background: "#BD4128", color: "#fff" } : { background: "#F1EBDD", color: "#5B6478" }}
              >
                <X size={15} strokeWidth={2.5} />
              </button>
              <button
                onClick={() => mark(s.id, "present")}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={state === "present" ? { background: "#2E7D4F", color: "#fff" } : { background: "#F1EBDD", color: "#5B6478" }}
              >
                <Check size={15} strokeWidth={2.5} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
