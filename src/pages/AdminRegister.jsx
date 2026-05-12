import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/client";

export default function AdminRegister() {
  const { user, isSuperAdmin } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("dispute_moderator");
  const [password, setPassword] = useState("");
  const [generatePassword, setGeneratePassword] = useState(true);
  const [req, setReq] = useState({
    policy: false,
    security: false,
    emailAck: false,
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  if (!user?.is_admin) {
    return <Navigate to="/admin/profiles" replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(null);

    if (!req.policy || !req.security || !req.emailAck) {
      setError("Confirm all onboarding requirements below.");
      return;
    }

    setBusy(true);
    try {
      const body = { name: name.trim(), email: email.trim(), role };
      if (!generatePassword && password.trim().length >= 8) {
        body.password = password.trim();
      }
      const res = await apiFetch("/api/admins", { method: "POST", body });
      setSuccess(res);
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          to="/admin/profiles"
          className="text-xs font-semibold text-slate-500 hover:text-primary"
        >
          ← Back to admin profiles
        </Link>
        <h1 className="text-2xl font-extrabold text-primary font-headline mt-2">
          Register new admin
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete the checklist and create a moderator account (super-admin role only for super admins) with a secure
          password.
        </p>
      </div>

      <section className="rounded-xl border border-amber-200 bg-amber-50/70 p-5 mb-6">
        <h2 className="text-sm font-bold text-amber-800 uppercase tracking-wide">
          Requirements
        </h2>
        <ul className="mt-3 space-y-2 text-[13px] text-slate-700">
          <label className="flex gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={req.policy}
              onChange={(e) =>
                setReq((r) => ({ ...r, policy: e.target.checked }))
              }
            />
            I confirm the appointee has read internal dispute-resolution policy.
          </label>
          <label className="flex gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={req.security}
              onChange={(e) =>
                setReq((r) => ({ ...r, security: e.target.checked }))
              }
            />
            I will deliver credentials through a secure channel (no email in plain workflow).
          </label>
          <label className="flex gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={req.emailAck}
              onChange={(e) =>
                setReq((r) => ({ ...r, emailAck: e.target.checked }))
              }
            />
            Work email is verified and unique in the platform.
          </label>
        </ul>
      </section>

      <form
        onSubmit={onSubmit}
        className="rounded-xl bg-surface-container-lowest border border-outline-variant/20 shadow-card p-6 space-y-4"
      >
        <div>
          <label className="text-xs font-bold uppercase text-slate-600">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-tertiary-fixed-dim"
            required
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-slate-600">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-tertiary-fixed-dim"
            required
          />
        </div>
        <div>
          <label className="text-xs font-bold uppercase text-slate-600">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-tertiary-fixed-dim"
          >
            <option value="dispute_moderator">Dispute moderator</option>
            {isSuperAdmin && <option value="super_admin">Super admin</option>}
          </select>
        </div>
        <div className="pt-2 border-t border-outline-variant/20">
          <label className="flex gap-2 items-center text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={generatePassword}
              onChange={(e) => setGeneratePassword(e.target.checked)}
            />
            Generate a one-time password (shown once in the response)
          </label>
          {!generatePassword && (
            <div className="mt-3">
              <label className="text-xs font-bold uppercase text-slate-600">
                Password (min 8 characters)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="mt-1 w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-tertiary-fixed-dim"
                minLength={8}
              />
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full py-3 rounded-lg bg-primary text-on-primary font-bold text-[11px] uppercase tracking-widest disabled:opacity-50"
        >
          {busy ? "Creating…" : "Create admin account"}
        </button>
      </form>

      {success?.initial_password && (
        <div className="mt-6 rounded-xl border-2 border-mint-400 bg-emerald-50 p-5">
          <p className="text-sm font-bold text-emerald-900">Save this password now</p>
          <code className="mt-2 block text-lg font-mono break-all bg-white px-3 py-2 rounded border">
            {success.initial_password}
          </code>
          <p className="text-xs text-emerald-800 mt-2">{success.initial_password_notice}</p>
        </div>
      )}
      {success && !success.initial_password && (
        <div className="mt-6 text-sm text-slate-600">
          Admin <strong>{success.name}</strong> created with your chosen password.
        </div>
      )}
    </div>
  );
}
