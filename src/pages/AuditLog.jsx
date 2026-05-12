import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, Download, Filter, Search } from "lucide-react";
import { apiFetch, getToken } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDateTime } from "../utils/format";
import { Navigate } from "react-router-dom";

const ACTION_OPTS = [
  "All Actions",
  "dispute_decision",
  "account_created",
  "role_changed",
  "account_deactivated",
  "evidence_reviewed",
  "status_updated",
];

export default function AuditLog() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("All Actions");

  const load = useCallback(async () => {
    try {
      const qs = new URLSearchParams();
      if (query.trim()) qs.set("q", query.trim());
      if (action !== "All Actions") qs.set("action_type", action);
      const suf = qs.toString() ? `?${qs.toString()}` : "";
      const data = await apiFetch(`/api/admin/audit-log${suf}`);
      setRows(data || []);
      setError("");
    } catch (e) {
      setError(e.message || "Failed.");
      setRows([]);
    }
  }, [query, action]);

  useEffect(() => {
    const t = setTimeout(load, 260);
    return () => clearTimeout(t);
  }, [load]);

  const filtered = useMemo(() => rows, [rows]);

  if (!user?.is_admin) {
    return <Navigate to="/disputes" replace />;
  }

  async function exportCsv() {
    const token = getToken();
    const res = await fetch("/api/admin/audit-log/export", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      alert("Export failed.");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-primary font-headline">
            System audit log
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Immutable administrative actions (centralized SPM schema).
          </p>
        </div>
        <button
          type="button"
          onClick={() => exportCsv()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant/40 bg-white text-[13px] font-semibold hover:bg-surface-container"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/15 p-3 mb-4 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search details or target ID…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-surface-container border border-transparent outline-none text-[13px] focus:border-tertiary-fixed-dim"
          />
        </div>
        <div className="relative min-w-[200px]">
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="appearance-none w-full pr-8 pl-3 py-2.5 rounded-lg border border-outline-variant/40 bg-white text-[13px] outline-none cursor-pointer"
          >
            {ACTION_OPTS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <button
          type="button"
          onClick={() => load()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container text-[13px] font-semibold border border-outline-variant/30"
        >
          <Filter className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 px-4 py-2 rounded-lg">{error}</div>
      )}

      <div className="bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/15 overflow-hidden overflow-x-auto">
        <table className="w-full text-[13px] min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-600">
              <Th>When</Th>
              <Th>Admin</Th>
              <Th>Action</Th>
              <Th>Target</Th>
              <Th>Details</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-surface-container-low/60">
                <Td>{formatDateTime(r.performed_at)}</Td>
                <Td>{r.admin_name || "—"}</Td>
                <Td>
                  <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-pill-mediationBg text-pill-mediationFg">
                    {r.action_type}
                  </span>
                </Td>
                <Td>
                  {r.target_entity_type} #{r.target_entity_id}
                </Td>
                <Td className="max-w-[320px] text-slate-600">{r.details}</Td>
              </tr>
            ))}
            {!error && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center text-slate-500 py-10">
                  No rows.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }) {
  return <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide">{children}</th>;
}

function Td({ children, className = "" }) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
