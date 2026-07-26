import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Save } from "lucide-react";
import TopBar from "../components/TopBar";
import VTag, { VERTICALS } from "../components/VTag";
import StatusChip from "../components/StatusChip";
import EditedBadge from "../components/EditedBadge";
import DateInput, { toISODate, fromISODate } from "../components/DateInput";
import { api } from "../lib/api";

const STATUS_OPTIONS = [
  { value: "active", label: "செயலில்" },
  { value: "paused", label: "தற்காலிக நிறுத்தம்" },
  { value: "left", label: "வெளியேறியது" },
];

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.student(id).then((r) => {
      setStudent(r.student);
      setForm({
        ...r.student,
        join_date_display: fromISODate(r.student.join_date),
      });
    });
  }, [id]);

  if (!student || !form) return null;
  const meta = VERTICALS[student.vertical];

  const save = async () => {
    setSaving(true);
    try {
      const { student: updated } = await api.updateStudent(id, {
        parent_phone: form.parent_phone,
        parent_name: form.parent_name,
        status: form.status,
        join_date: toISODate(form.join_date_display) || student.join_date,
        custom_fields: { ...student.custom_fields, [meta.field]: form.custom_fields?.[meta.field] },
      });
      setStudent(updated);
      setForm({ ...updated, join_date_display: fromISODate(updated.join_date) });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <TopBar title={student.name} onBack={() => navigate(-1)} right={
        <button onClick={() => (editing ? save() : setEditing(true))} disabled={saving} className="text-white">
          {editing ? <Save size={18} /> : <Pencil size={18} />}
        </button>
      } />
      <div className="px-4 pt-4 pb-6">
        <div className="rounded-card p-4 mb-4 bg-white border border-line">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: meta.soft, color: meta.color }}>
                {student.name[0]}
              </div>
              <div>
                <div className="font-bold font-display text-ink">{student.name}</div>
                <VTag vertical={student.vertical} small />
              </div>
            </div>
            <EditedBadge isEdited={student.is_edited} editedAt={student.edited_at} />
          </div>

          <div className="text-xs font-semibold uppercase tracking-wide mb-2 text-inksoft">பொது தகவல் · Core</div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="text-[11px] text-inksoft">பெற்றோர் நம்பர்</div>
              {editing ? (
                <input
                  type="tel" inputMode="numeric"
                  value={form.parent_phone}
                  onChange={(e) => setForm((f) => ({ ...f, parent_phone: e.target.value.replace(/[^0-9]/g, "").slice(0, 10) }))}
                  className="numeric-field w-full rounded-lg border border-line px-2 py-1.5 text-sm mt-1"
                />
              ) : (
                <div className="text-sm font-semibold text-ink">{student.parent_phone}</div>
              )}
            </div>
            <div>
              <div className="text-[11px] text-inksoft">நிலை · Status</div>
              {editing ? (
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                  className="w-full rounded-lg border border-line px-2 py-1.5 text-sm mt-1 bg-white"
                >
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <div className="text-sm font-semibold text-ink">{STATUS_OPTIONS.find((o) => o.value === student.status)?.label}</div>
              )}
            </div>
          </div>

          {editing ? (
            <DateInput label="சேர்ந்த தேதி" labelEn="Join Date" value={form.join_date_display} onChange={(v) => setForm((f) => ({ ...f, join_date_display: v }))} />
          ) : (
            <div className="mb-4">
              <div className="text-[11px] text-inksoft">சேர்ந்த தேதி · Join Date</div>
              <div className="text-sm font-semibold text-ink">{fromISODate(student.join_date)}</div>
            </div>
          )}

          <div className="text-xs font-semibold uppercase tracking-wide mt-4 mb-2" style={{ color: meta.color }}>
            {meta.ta} · Vertical field
          </div>
          <div className="rounded-xl p-3" style={{ background: meta.soft }}>
            <div className="text-[11px]" style={{ color: meta.color }}>
              {meta.fieldLabelTa} <span className="opacity-70">· {meta.fieldLabelEn}</span>
            </div>
            {editing ? (
              <input
                value={form.custom_fields?.[meta.field] || ""}
                onChange={(e) => setForm((f) => ({ ...f, custom_fields: { ...f.custom_fields, [meta.field]: e.target.value } }))}
                placeholder="e.g. Brown Belt"
                className="w-full rounded-lg border border-line px-2 py-1.5 text-sm mt-1 bg-white"
              />
            ) : (
              <div className="text-sm font-bold text-ink">{student.custom_fields?.[meta.field] || "—"}</div>
            )}
          </div>
        </div>

        <p className="text-[11px] text-center text-inksoft">
          "பொது தகவல்" எல்லா verticals-க்கும் common. {meta.ta} field மட்டும் இந்த academy-க்கு configure ஆனது.
        </p>
      </div>
    </div>
  );
}
