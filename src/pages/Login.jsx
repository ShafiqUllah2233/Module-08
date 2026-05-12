import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/disputes";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!loading && user) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-surface-container-low to-surface">
      <header className="h-16 flex items-center px-8 border-b border-outline-variant/20 bg-primary text-on-primary">
        <span className="text-lg font-black uppercase tracking-tight font-headline">
          Nexus Pro
        </span>
      </header>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl shadow-card bg-surface-container-lowest border border-outline-variant/20 p-8">
          <h1 className="text-2xl font-extrabold text-primary font-headline tracking-tight">
            Sign in
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Use your Nexus account email and password. The API runs at{" "}
            <code className="text-xs bg-surface-container px-1 py-0.5 rounded">
              localhost:4000
            </code>{" "}
            with Vite proxying{" "}
            <code className="text-xs bg-surface-container px-1 py-0.5 rounded">
              /api
            </code>
            .
          </p>

          <form className="mt-8 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-tertiary-fixed-dim"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-outline-variant/40 bg-surface px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-tertiary-fixed-dim"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 rounded-lg bg-primary text-on-primary font-bold text-[11px] uppercase tracking-widest shadow hover:opacity-95 disabled:opacity-50"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="text-[11px] text-slate-500 mt-6 text-center">
            Demo seed: <span className="font-mono">alice@example.com</span> /{" "}
            <span className="font-mono">password</span>
          </p>
        </div>
      </div>
      <footer className="py-6 text-center text-[11px] text-slate-500">
        G08 — Dispute Resolution module
      </footer>
    </div>
  );
}
