import { supabase } from "./supabaseClient";

const API_URL = import.meta.env.VITE_API_URL;

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(await authHeader()), ...(options.headers || {}) };
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || "ஏதோ தவறு நடந்தது");
  return body;
}

// Login goes straight to the backend (which owns the pseudo-email
// conversion) rather than calling supabase.auth directly with an email.
export async function login(phone, password) {
  const body = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ phone, password }) });
  await supabase.auth.setSession(body.session);
  return body.user;
}

export const api = {
  academy: () => request("/api/academies/me"),
  students: (params = {}) => request(`/api/students?${new URLSearchParams(params)}`),
  student: (id) => request(`/api/students/${id}`),
  createStudent: (payload) => request("/api/students", { method: "POST", body: JSON.stringify(payload) }),
  updateStudent: (id, payload) => request(`/api/students/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  batches: (params = {}) => request(`/api/batches?${new URLSearchParams(params)}`),
  attendanceBulk: (records) => request("/api/attendance/bulk", { method: "POST", body: JSON.stringify({ records }) }),
  payments: (params = {}) => request(`/api/payments?${new URLSearchParams(params)}`),
  markPaid: (id, method) => request(`/api/payments/${id}/mark-paid`, { method: "POST", body: JSON.stringify({ method }) }),
  sendReminder: (id) => request(`/api/payments/${id}/send-reminder`, { method: "POST" }),
};
