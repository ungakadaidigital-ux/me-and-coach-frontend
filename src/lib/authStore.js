const STORAGE_KEY = "meandcoach_refresh_token";

/**
 * refresh_token persisted to localStorage so a page reload doesn't
 * force re-login. access_token is memory-only (shorter-lived, less
 * damaging if leaked). Storing the refresh token in localStorage is
 * an XSS-risk tradeoff, same one most SPA-only (no BFF) setups make —
 * worth revisiting with an httpOnly cookie if this app ever needs to
 * defend against a stricter threat model than "typical small-business
 * SaaS."
 */
function parseClaims(accessToken) {
  if (!accessToken) return null;
  const payload = JSON.parse(atob(accessToken.split(".")[1]));
  return { userId: payload.sub, academyId: payload.academy_id, role: payload.role, coachId: payload.coach_id };
}

let state = {
  accessToken: null,
  refreshToken: typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null,
  claims: null,
};
const listeners = new Set();

function setSession({ access_token, refresh_token }) {
  state = { accessToken: access_token, refreshToken: refresh_token, claims: parseClaims(access_token) };
  if (refresh_token) localStorage.setItem(STORAGE_KEY, refresh_token);
  listeners.forEach((l) => l());
}

function clearSession() {
  state = { accessToken: null, refreshToken: null, claims: null };
  localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((l) => l());
}

function getState() {
  return state;
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const authStore = { setSession, clearSession, getState, subscribe };
