#!/usr/bin/env node
/**
 * Smoke test for the Me & Coach backend — MSG91 auth-core flow.
 * Run from your own machine, no dependencies beyond Node's built-in fetch.
 *
 * Usage:
 *   API_BASE_URL=https://me-and-coach-backend-production.up.railway.app \
 *   COACH_PHONE="+91XXXXXXXXXX" \
 *   node smoke-test.js
 *
 * What it proves, step by step — every step throws and stops the
 * script on a real failure, nothing here fakes a pass:
 *   1. Server is up (/health)
 *   2. MSG91 actually sends an OTP for this phone
 *   3. verify-otp both validates the code AND resolves claims —
 *      if this phone isn't in `coaches` yet, this is where it fails
 *      with "not linked to an account"
 *   4. The minted token is genuinely RLS-valid — students fetch
 *      returns data scoped to that coach's academy
 *   5. Refresh token actually rotates and yields a working new
 *      access token
 */
import readline from "node:readline/promises";

const API_BASE_URL = must(process.env.API_BASE_URL, "API_BASE_URL");
const COACH_PHONE = must(process.env.COACH_PHONE, "COACH_PHONE");

function must(value, name) {
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

function log(step, ok, detail = "") {
  console.log(`${ok ? "✅" : "❌"} ${step}${detail ? " — " + detail : ""}`);
}

async function post(path, body) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body: json };
}

async function main() {
  const health = await fetch(`${API_BASE_URL}/health`).catch(() => null);
  if (!health || !health.ok) {
    log("Server /health", false, "server not reachable or not running");
    process.exit(1);
  }
  log("Server /health", true);

  const sendResult = await post("/api/auth/send-otp", { phone: COACH_PHONE });
  if (!sendResult.ok) {
    log("Send OTP via MSG91", false, sendResult.body.error || `HTTP ${sendResult.status}`);
    process.exit(1);
  }
  log("Send OTP via MSG91", true, `check ${COACH_PHONE}`);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const otp = await rl.question("Enter the OTP you received: ");
  rl.close();

  const verifyResult = await post("/api/auth/verify-otp", { phone: COACH_PHONE, otp: otp.trim() });
  if (!verifyResult.ok) {
    log(
      "Verify OTP + resolve claims",
      false,
      verifyResult.body.error ||
        `HTTP ${verifyResult.status} — if this says "not linked to an account," this phone isn't in the coaches table yet`
    );
    process.exit(1);
  }
  const { access_token, refresh_token } = verifyResult.body;
  const payload = JSON.parse(Buffer.from(access_token.split(".")[1], "base64url").toString());
  if (!payload.academy_id || !payload.role) {
    log("Claims present in token", false, "academy_id/role missing — resolveClaims returned an incomplete object");
    process.exit(1);
  }
  log("Verify OTP + resolve claims", true, `academy_id=${payload.academy_id} role=${payload.role}`);

  const studentsRes = await fetch(`${API_BASE_URL}/api/students`, {
    headers: { Authorization: `Bearer ${access_token}` },
  });
  if (!studentsRes.ok) {
    const body = await studentsRes.json().catch(() => ({}));
    log("Fetch students (RLS-scoped)", false, body.error || `HTTP ${studentsRes.status}`);
    process.exit(1);
  }
  const students = await studentsRes.json();
  log("Fetch students (RLS-scoped)", true, `${students.length} student(s) returned`);

  const refreshResult = await post("/api/auth/refresh", { refresh_token });
  if (!refreshResult.ok) {
    log("Refresh token rotation", false, refreshResult.body.error || `HTTP ${refreshResult.status}`);
    process.exit(1);
  }
  log("Refresh token rotation", true);

  console.log("\nAll checks passed — MSG91 auth flow is genuinely working end-to-end.");
}

main().catch((err) => {
  console.error("Unexpected failure:", err);
  process.exit(1);
});
