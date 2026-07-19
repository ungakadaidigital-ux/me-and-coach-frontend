import React, { useEffect, useMemo, useState } from "react";
import {
  Home, Users, ClipboardCheck, IndianRupee, Calendar,
  Swords, Trophy, Music, Check, X, Send, Wifi, WifiOff,
  ChevronLeft, Bell, Search, Clock, MapPin, CircleCheck,
} from "lucide-react";

import { useSession } from "./hooks/useSession.js";
import { useStudents } from "./hooks/useStudents.js";
import { useBatches, isBatchToday } from "./hooks/useBatches.js";
import { useVerticalConfigs } from "./hooks/useVerticalConfigs.js";
import { useAttendance } from "./hooks/useAttendance.js";
import { usePayments } from "./hooks/usePayments.js";
import { useAttendanceStats } from "./hooks/useAttendanceStats.js";

const C = {
  ink: "#131A2B", inkSoft: "#5B6478", chalk: "#FAF7F1", chalkDeep: "#F1EBDD",
  card: "#FFFFFF", line: "#E7E0D2", marigold: "#F2A93B", marigoldDeep: "#C97F16",
  teal: "#166B5C", tealSoft: "#E3F0EC", clay: "#BD4128", claySoft: "#FBEAE4",
  plum: "#6B3A5C", plumSoft: "#F1E6EF", green: "#2E7D4F", greenSoft: "#E5F3EA",
};

// Visual identity per vertical stays fixed (color/icon) — only the
// FIELD LABELS are academy-configurable, via useVerticalConfigs.
const VERTICAL_STYLE = {
  martial: { color: C.teal, soft: C.tealSoft, icon: Swords, ta: "தற்கலை" },
  sports: { color: C.clay, soft: C.claySoft, icon: Trophy, ta: "விளையாட்டு" },
  arts: { color: C.plum, soft: C.plumSoft, icon: Music, ta: "நடனம் / இசை" },
};

const NAV = [
  { key: "dashboard", label: "முகப்பு", icon: Home },
  { key: "students", label: "மாணவர்கள்", icon: Users },
  { key: "attendance", label: "வருகை", icon: ClipboardCheck },
  { key: "payments", label: "கட்டணம்", icon: IndianRupee },
  { key: "schedule", label: "அட்டவணை", icon: Calendar },
];

/* ---------------- LOGIN ---------------- */
function Login() {
  const { signInWithPhone, verifyOtp } = useSession();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [stage, setStage] = useState("phone"); // phone | otp
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const sendOtp = async () => {
    setBusy(true); setError(null);
    try {
      await signInWithPhone(phone);
      setStage("otp");
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const confirm = async () => {
    setBusy(true); setError(null);
    try {
      await verifyOtp(phone, otp);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const devLogin = async () => {
    setBusy(true); setError(null);
    const base = import.meta.env.VITE_API_BASE_URL;
    if (!base) {
      setError("VITE_API_BASE_URL is not set in this deployment — check Vercel env vars.");
      setBusy(false);
      return;
    }
    try {
      const res = await fetch(`${base}/api/auth/dev-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Dev login failed");
      const { authStore } = await import("./lib/authStore.js");
      authStore.setSession(json);
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center" style={{ background: C.chalk }}>
      <div className="w-[320px] rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
        <div className="text-lg font-bold mb-4" style={{ color: C.ink }}>Me & Coach</div>
        {stage === "phone" ? (
          <>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91XXXXXXXXXX"
              className="w-full rounded-lg px-3 py-2 text-sm mb-3" style={{ border: `1px solid ${C.line}` }} />
            <button onClick={sendOtp} disabled={busy} className="w-full py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: C.marigold, color: C.ink }}>OTP அனுப்பு</button>
            {import.meta.env.VITE_DEV_LOGIN === "true" && (
              <button onClick={devLogin} disabled={busy || !phone} className="w-full py-2 rounded-xl text-xs font-semibold mt-2"
                style={{ background: C.chalkDeep, color: C.inkSoft, border: `1px dashed ${C.line}` }}>
                ⚠ Dev Login (skip OTP)
              </button>
            )}
          </>
        ) : (
          <>
            <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="OTP"
              className="w-full rounded-lg px-3 py-2 text-sm mb-3" style={{ border: `1px solid ${C.line}` }} />
            <button onClick={confirm} disabled={busy} className="w-full py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: C.marigold, color: C.ink }}>உறுதிப்படுத்து</button>
          </>
        )}
        {error && <div className="text-xs mt-2" style={{ color: C.clay }}>{error}</div>}
      </div>
    </div>
  );
}

function VTag({ v, small }) {
  const meta = VERTICAL_STYLE[v];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${small ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1"}`}
      style={{ background: meta.soft, color: meta.color }}>
      <Icon size={small ? 11 : 13} strokeWidth={2.5} /> {meta.ta}
    </span>
  );
}

function StatusChip({ status }) {
  const map = {
    paid: { label: "கட்டி முடிச்சாச்சு", bg: C.greenSoft, fg: C.green },
    due: { label: "நிலுவை", bg: "#FCF3E3", fg: C.marigoldDeep },
    overdue: { label: "தாமதம்", bg: C.claySoft, fg: C.clay },
  };
  const s = map[status] || map.due;
  return <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.fg }}>{s.label}</span>;
}

function TopBar({ title, onBack, right }) {
  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-3" style={{ background: C.ink }}>
      <div className="flex items-center gap-2">
        {onBack && <button onClick={onBack} className="p-1 -ml-1 rounded-full active:opacity-60"><ChevronLeft size={20} color="#fff" /></button>}
        <div className="text-white font-semibold text-[15px]">{title}</div>
      </div>
      {right}
    </div>
  );
}

/* ---------------- DASHBOARD ---------------- */
function Dashboard({ setTab }) {
  const { batches } = useBatches();
  const { payments } = usePayments({ status: "due" });
  const avgAttendance = useAttendanceStats();
  const todaysBatches = useMemo(() => batches.filter((b) => isBatchToday(b)), [batches]);
  const dueTotal = payments.reduce((a, p) => a + Number(p.amount), 0);

  return (
    <div className="px-4 pt-4 pb-6" style={{ background: C.chalk }}>
      <div className="text-2xl font-bold mb-4" style={{ color: C.ink }}>வணக்கம், கோச்! 🙏</div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-2xl p-3.5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="text-xs mb-1" style={{ color: C.inkSoft }}>இன்றைய வகுப்புகள்</div>
          <div className="text-2xl font-bold" style={{ color: C.ink }}>{todaysBatches.length}</div>
        </div>
        <div className="rounded-2xl p-3.5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="text-xs mb-1" style={{ color: C.inkSoft }}>சராசரி வருகை (30 நாள்)</div>
          <div className="text-2xl font-bold" style={{ color: C.ink }}>{avgAttendance == null ? "—" : `${avgAttendance}%`}</div>
        </div>
        <div className="rounded-2xl p-3.5 col-span-2" style={{ background: C.ink }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs mb-1" style={{ color: "#B7BECC" }}>நிலுவை கட்டணம்</div>
              <div className="text-2xl font-bold text-white">₹{dueTotal.toLocaleString("en-IN")}</div>
            </div>
            <button onClick={() => setTab("payments")} className="text-xs font-semibold px-3 py-2 rounded-full flex items-center gap-1" style={{ background: C.marigold, color: C.ink }}>
              <Send size={13} /> நினைவூட்டல்
            </button>
          </div>
        </div>
      </div>
      <div className="text-sm font-semibold mb-2" style={{ color: C.ink }}>இன்றைய அட்டவணை</div>
      <div className="space-y-2">
        {todaysBatches.slice(0, 3).map((b) => {
          const meta = VERTICAL_STYLE[b.vertical];
          return (
            <div key={b.id} className="flex items-center gap-3 rounded-xl p-2.5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div className="w-1 h-9 rounded-full" style={{ background: meta?.color }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate" style={{ color: C.ink }}>{b.name}</div>
                <div className="text-xs flex items-center gap-1" style={{ color: C.inkSoft }}>
                  <Clock size={11} /> {b.start_time} <span className="mx-0.5">·</span> <MapPin size={11} /> {b.location}
                </div>
              </div>
            </div>
          );
        })}
        {todaysBatches.length === 0 && <div className="text-sm text-center py-4" style={{ color: C.inkSoft }}>இன்று வகுப்புகள் இல்லை</div>}
      </div>
    </div>
  );
}

/* ---------------- STUDENTS ---------------- */
function Students({ onOpen }) {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const { students, loading } = useStudents({ vertical: filter === "all" ? undefined : filter });
  const list = students.filter((s) => s.name.includes(q));

  return (
    <div style={{ background: C.chalk }} className="min-h-full">
      <div className="px-4 pt-2 pb-3">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2 mb-3" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <Search size={15} color={C.inkSoft} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="மாணவர் பெயர் தேடு..."
            className="text-sm outline-none flex-1 bg-transparent" style={{ color: C.ink }} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["all", ...Object.keys(VERTICAL_STYLE)].map((k) => (
            <button key={k} onClick={() => setFilter(k)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap shrink-0"
              style={filter === k ? { background: k === "all" ? C.ink : VERTICAL_STYLE[k].color, color: "#fff" } : { background: C.card, color: C.inkSoft, border: `1px solid ${C.line}` }}>
              {k === "all" ? "அனைத்தும்" : VERTICAL_STYLE[k].ta}
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 space-y-2 pb-4">
        {loading && <div className="text-sm text-center py-6" style={{ color: C.inkSoft }}>ஏற்றுகிறது…</div>}
        {list.map((s) => (
          <button key={s.id} onClick={() => onOpen(s)} className="w-full text-left flex items-center gap-3 rounded-xl p-3" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: VERTICAL_STYLE[s.vertical]?.soft, color: VERTICAL_STYLE[s.vertical]?.color }}>{s.name[0]}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold" style={{ color: C.ink }}>{s.name}</div>
            </div>
            <VTag v={s.vertical} small />
          </button>
        ))}
        {!loading && list.length === 0 && <div className="text-center text-sm py-10" style={{ color: C.inkSoft }}>எந்த மாணவரும் கிடைக்கலை</div>}
      </div>
    </div>
  );
}

function StudentDetail({ student, onBack }) {
  const meta = VERTICAL_STYLE[student.vertical];
  const { configs } = useVerticalConfigs(student.vertical); // academy-defined fields, not hardcoded
  return (
    <div style={{ background: C.chalk }} className="min-h-full">
      <TopBar title={student.name} onBack={onBack} />
      <div className="px-4 pt-4 pb-6">
        <div className="rounded-2xl p-4 mb-4" style={{ background: C.card, border: `1px solid ${C.line}` }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: meta?.soft, color: meta?.color }}>{student.name[0]}</div>
            <div><div className="font-bold" style={{ color: C.ink }}>{student.name}</div><VTag v={student.vertical} small /></div>
          </div>
          <div className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: C.inkSoft }}>பொது தகவல்</div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div><div className="text-[11px]" style={{ color: C.inkSoft }}>பெற்றோர் தொலைபேசி</div><div className="text-sm font-semibold" style={{ color: C.ink }}>{student.parent_phone}</div></div>
            <div><div className="text-[11px]" style={{ color: C.inkSoft }}>நிலை</div><div className="text-sm font-semibold" style={{ color: C.ink }}>{student.status}</div></div>
          </div>
          {configs.map((cfg) => (
            <div key={cfg.field_key} className="rounded-xl p-3 mb-2" style={{ background: meta?.soft }}>
              <div className="text-[11px]" style={{ color: meta?.color }}>{cfg.field_label_ta}</div>
              <div className="text-sm font-bold" style={{ color: C.ink }}>{student.custom_fields?.[cfg.field_key] ?? "—"}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- ATTENDANCE ---------------- */
function Attendance() {
  const { batches } = useBatches();
  const todays = useMemo(() => batches.filter((b) => isBatchToday(b)), [batches]);
  const [batchId, setBatchId] = useState(null);
  useEffect(() => { if (!batchId && todays.length) setBatchId(todays[0].id); }, [todays, batchId]);

  const batch = todays.find((b) => b.id === batchId);
  const { students: roster } = useStudents({ batchId: batchId || undefined });
  const { marks, mark, pendingCount, syncing, syncError, retrySync } = useAttendance(batchId);
  const presentCount = Object.values(marks).filter((v) => v === "present").length;
  const pendingOffline = !syncing && !syncError && pendingCount > 0;

  if (!batch) return <div className="text-sm text-center py-10" style={{ color: C.inkSoft }}>இன்று வகுப்புகள் இல்லை</div>;

  return (
    <div style={{ background: C.chalk }} className="min-h-full">
      <div className="px-4 pt-3 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {todays.map((b) => (
            <button key={b.id} onClick={() => setBatchId(b.id)}
              className="text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap shrink-0"
              style={b.id === batchId ? { background: VERTICAL_STYLE[b.vertical]?.color, color: "#fff" } : { background: C.card, color: C.inkSoft, border: `1px solid ${C.line}` }}>
              {b.start_time} · {VERTICAL_STYLE[b.vertical]?.ta}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-xl p-3 mb-2" style={{ background: C.ink }}>
          <div>
            <div className="text-white text-sm font-semibold">{batch.name}</div>
            <div className="text-xs" style={{ color: "#AEB6C6" }}>{presentCount}/{roster.length} வந்திருக்காங்க</div>
          </div>
          <button onClick={syncError || pendingOffline ? retrySync : undefined}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
            style={syncError || pendingOffline ? { background: C.claySoft, color: C.clay } : { background: syncing ? "#3A3220" : C.greenSoft, color: syncing ? C.marigold : C.green }}>
            {syncError ? <><WifiOff size={12} /> மீண்டும் முயற்சி</> :
             pendingOffline ? <><WifiOff size={12} /> {pendingCount} பென்டிங்</> :
             <><Wifi size={12} /> {syncing ? "சேமிக்கிறது…" : "ஒத்திசைவு முடிந்தது"}</>}
          </button>
        </div>
      </div>
      <div className="px-4 space-y-2 pb-6">
        {roster.map((s) => {
          const state = marks[s.id];
          return (
            <div key={s.id} className="flex items-center gap-3 rounded-xl p-2.5" style={{ background: C.card, border: `1px solid ${C.line}` }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: VERTICAL_STYLE[s.vertical]?.soft, color: VERTICAL_STYLE[s.vertical]?.color }}>{s.name[0]}</div>
              <div className="flex-1 text-sm font-semibold" style={{ color: C.ink }}>{s.name}</div>
              <button onClick={() => mark(s.id, "absent")} className="w-8 h-8 rounded-full flex items-center justify-center" style={state === "absent" ? { background: C.clay, color: "#fff" } : { background: C.chalkDeep, color: C.inkSoft }}><X size={15} strokeWidth={2.5} /></button>
              <button onClick={() => mark(s.id, "present")} className="w-8 h-8 rounded-full flex items-center justify-center" style={state === "present" ? { background: C.green, color: "#fff" } : { background: C.chalkDeep, color: C.inkSoft }}><Check size={15} strokeWidth={2.5} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- PAYMENTS ---------------- */
function Payments() {
  const { payments, sentIds, sendReminder } = usePayments({ status: "due" });
  const dueTotal = payments.reduce((a, p) => a + Number(p.amount), 0);

  return (
    <div style={{ background: C.chalk }} className="min-h-full pb-6">
      <div className="px-4 pt-3 pb-2">
        <div className="rounded-xl p-3 mb-3" style={{ background: C.ink }}>
          <div className="text-xs" style={{ color: "#AEB6C6" }}>மொத்த நிலுவை</div>
          <div className="text-xl font-bold text-white">₹{dueTotal.toLocaleString("en-IN")}</div>
        </div>
      </div>
      <div className="px-4 space-y-2">
        {payments.map((p) => (
          <div key={p.id} className="rounded-xl p-3" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div className="flex items-center justify-between mb-2">
              <div><div className="text-sm font-semibold" style={{ color: C.ink }}>{p.students?.name}</div><VTag v={p.vertical} small /></div>
              <div className="text-right"><div className="text-sm font-bold" style={{ color: C.clay }}>₹{p.amount}</div><StatusChip status={p.status} /></div>
            </div>
            <button onClick={() => sendReminder(p.id)} disabled={sentIds[p.id]}
              className="w-full text-xs font-semibold py-2 rounded-lg flex items-center justify-center gap-1.5"
              style={sentIds[p.id] ? { background: C.greenSoft, color: C.green } : { background: "#E9F5EC", color: C.green, border: "1px solid #BFE3CB" }}>
              {sentIds[p.id] ? <><CircleCheck size={13} /> WhatsApp அனுப்பிட்டாச்சு</> : <><Send size={13} /> WhatsApp நினைவூட்டல்</>}
            </button>
          </div>
        ))}
        {payments.length === 0 && <div className="text-center text-sm py-10" style={{ color: C.inkSoft }}>நிலுவை இல்லை 🎉</div>}
      </div>
    </div>
  );
}

/* ---------------- SCHEDULE ---------------- */
function Schedule() {
  const { batches } = useBatches();
  return (
    <div style={{ background: C.chalk }} className="min-h-full px-4 pt-3 pb-6 space-y-2">
      {batches.map((b) => {
        const meta = VERTICAL_STYLE[b.vertical];
        const Icon = meta?.icon;
        return (
          <div key={b.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: C.card, border: `1px solid ${C.line}` }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: meta?.soft }}>
              {Icon && <Icon size={18} color={meta.color} strokeWidth={2.2} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold" style={{ color: C.ink }}>{b.name}</div>
              <div className="text-xs" style={{ color: C.inkSoft }}>{b.location}</div>
            </div>
            <div className="text-xs font-bold" style={{ color: meta?.color }}>{b.start_time}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- ROOT ---------------- */
export default function MeAndCoachApp() {
  const { loading, session } = useSession();
  const [tab, setTab] = useState("dashboard");
  const [student, setStudent] = useState(null);

  if (loading) return null;
  if (!session) return <Login />;

  let body;
  if (student) body = <StudentDetail student={student} onBack={() => setStudent(null)} />;
  else if (tab === "dashboard") body = <Dashboard setTab={setTab} />;
  else if (tab === "students") body = <Students onOpen={setStudent} />;
  else if (tab === "attendance") body = <Attendance />;
  else if (tab === "payments") body = <Payments />;
  else body = <Schedule />;

  const titles = { dashboard: "Me & Coach", students: "மாணவர்கள்", attendance: "வருகை", payments: "கட்டணம்", schedule: "அட்டவணை" };

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ background: C.chalk }}>
      {!student && <TopBar title={titles[tab]} right={<Bell size={18} color="#fff" />} />}
      <div className="flex-1 overflow-y-auto">{body}</div>
      {!student && (
        <div className="flex items-stretch border-t" style={{ borderColor: C.line, background: C.card }}>
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = tab === n.key;
            return (
              <button key={n.key} onClick={() => setTab(n.key)} className="flex-1 flex flex-col items-center gap-1 py-2.5">
                <Icon size={18} color={active ? C.marigoldDeep : C.inkSoft} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-semibold" style={{ color: active ? C.marigoldDeep : C.inkSoft }}>{n.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

