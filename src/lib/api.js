import { authStore } from "./authStore.js";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!BASE_URL) {
  // Fails loudly at first use instead of silently building a relative
  // URL that hits this frontend's own domain and returns an HTML 404 —
  // which used to surface as a confusing "not valid JSON" error.
  console.error("VITE_API_BASE_URL is not set — check your Vercel/build environment variables.");
}

async function tryRefresh() {
  const { refreshToken } = authStore.getState();
  if (!refreshToken) return false;
  const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) {
    authStore.clearSession();
    return false;
  }
  authStore.setSession(await res.json());
  return true;
}

async function request(path, options = {}, isRetry = false) {
  const { accessToken } = authStore.getState();
  if (!accessToken) throw new Error("Not signed in");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  // Access tokens live 1 hour — a 401 mid-session means it just
  // expired, not that the user is unauthenticated. Refresh once,
  // then retry; only surface an error if that also fails.
  if (res.status === 401 && !isRetry) {
    const refreshed = await tryRefresh();
    if (refreshed) return request(path, options, true);
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `Request failed: ${res.status}`);
  return body;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
};
