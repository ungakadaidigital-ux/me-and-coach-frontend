import { useEffect, useState, useSyncExternalStore } from "react";
import { authStore } from "../lib/authStore.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function raw(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request failed: ${res.status}`);
  return json;
}

/**
 * Returns { loading, session, claims, signInWithPhone, verifyOtp, signOut }.
 * On mount, tries to restore a session from a persisted refresh token
 * so a page reload doesn't force re-login.
 */
export function useSession() {
  const state = useSyncExternalStore(authStore.subscribe, authStore.getState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { refreshToken, accessToken } = authStore.getState();
    if (accessToken || !refreshToken) {
      setLoading(false);
      return;
    }
    raw("/api/auth/refresh", { refresh_token: refreshToken })
      .then((session) => authStore.setSession(session))
      .catch(() => authStore.clearSession())
      .finally(() => setLoading(false));
  }, []);

  const signInWithPhone = (phone) => raw("/api/auth/send-otp", { phone });

  const verifyOtp = async (phone, otp) => {
    const session = await raw("/api/auth/verify-otp", { phone, otp });
    authStore.setSession(session);
    return session;
  };

  const signOut = () => authStore.clearSession();

  return {
    loading,
    session: state.accessToken ? state : null,
    claims: state.claims,
    signInWithPhone,
    verifyOtp,
    signOut,
  };
}

