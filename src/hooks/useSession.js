import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

function parseClaims(session) {
  if (!session) return null;
  const payload = JSON.parse(atob(session.access_token.split(".")[1]));
  return {
    userId: session.user.id,
    academyId: payload.academy_id || null,
    role: payload.role || null,
    coachId: payload.coach_id || null,
  };
}

/**
 * Returns { loading, session, claims, signInWithPhone, verifyOtp, signOut }.
 * claims is null until the coach's auth user has been linked
 * (see backend POST /api/auth/link-coach) AND the session token
 * has been refreshed at least once after that.
 */
export function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signInWithPhone = (phone) => supabase.auth.signInWithOtp({ phone });

  const verifyOtp = async (phone, token) => {
    const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
    if (error) throw error;
    return data.session;
  };

  const signOut = () => supabase.auth.signOut();

  return {
    loading,
    session,
    claims: parseClaims(session),
    signInWithPhone,
    verifyOtp,
    signOut,
  };
}

