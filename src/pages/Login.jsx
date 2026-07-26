import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../lib/api";

// Design & Product Principles #1:
// - Phone + Password only. No email, no magic link, no OTP screen.
// - "Log In" is the one primary action; "Sign Up" is a small secondary
//   link below it, not an equal-weight tab — self-registration isn't the
//   default path during the manual account-creation phase.
// - "Forgot password" is plain text pointing at support, not an email flow.
export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(phone, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-chalk px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-2xl font-bold font-display text-ink">Me & Coach</div>
          <div className="text-sm text-inksoft mt-1">உங்க அகாடமியை நிர்வகியுங்கள்</div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-card border border-line p-5 space-y-4">
          <label className="block">
            <span className="block text-xs font-semibold mb-1 text-inksoft">Phone Number · போன் நம்பர்</span>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, "").slice(0, 10))}
              placeholder="98400 00000"
              required
              className="numeric-field w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-marigold"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-semibold mb-1 text-inksoft">Password · கடவுச்சொல்</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-marigold"
            />
          </label>

          {error && <div className="text-xs font-medium text-clay">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-semibold bg-ink text-white disabled:opacity-60"
          >
            {loading ? "நுழைகிறது…" : "Log In"}
          </button>

          <p className="text-center text-xs text-inksoft">
            கணக்கு இல்லையா?{" "}
            <a href="tel:+919840000000" className="font-semibold text-marigolddeep">
              Support-ஐ அழையுங்கள்
            </a>
          </p>
        </form>

        <p className="text-center text-xs text-inksoft mt-4">
          கடவுச்சொல் மறந்துவிட்டதா? Support-ஐ அழையுங்கள் — உடனே reset பண்ணித் தருவோம்.
        </p>
      </div>
    </div>
  );
}
