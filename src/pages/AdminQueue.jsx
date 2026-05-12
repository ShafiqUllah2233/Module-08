import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ChevronDown, Filter, Search, Shield, UserPlus } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { DISPUTE_TYPES, USER_STATUS_FILTERS } from "../constants/dispute";
import { formatDate } from "../utils/format";

function StatCard({ value, label, valueClass = "text-primary" }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-card px-5 py-4 border border-outline-variant/15">
      <div className={`text-[28px] leading-none font-extrabold font-headline ${valueClass}`}>
        {value}
      </div>
      <div className="mt-2 text-[12px] text-slate-500">{label}</div>
    </div>
  );
}

export default function AdminQueue() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [assigneeFilter, setAssigneeFilter] = useState("All");

  const adminProfileId = user?.admin_profile?.id;

  const load = useCallback(async () => {
    try {
      const [disputes, sum] = await Promise.all([
        apiFetch(`/api/disputes${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`),
        apiFetch("/api/disputes/summary"),
      ]);
      setList(disputes);
      setSummary(sum);
      setError("");
    } catch (e) {
      setError(e.message || "Failed to load queue.");
    }
  }, [query]);

  useEffect(() => {
    const t = setTimeout(load, 280);
    return () => clearTimeout(t);
  }, [load]);

  const statusFn = useMemo(
    () =>
      USER_STATUS_FILTERS.find((f) => f.label === statusFilter)?.match ||
      (() => true),
    [statusFilter]
  );

  const rows = useMemo(() => {
    if (!user?.is_admin) return [];
    let r = list.filter((d) => statusFn(d.status));
    const typeOpt = DISPUTE_TYPES.find((t) => t.label === typeFilter);
    if (typeOpt) r = r.filter((d) => d.dispute_type === typeOpt.value);
    if (assigneeFilter === "Assigned to me" && adminProfileId) {
      r = r.filter((d) => d.assigned_admin?.id === adminProfileId);
    } else if (assigneeFilter === "Unassigned") {
      r = r.filter((d) => !d.assigned_admin);
    }
    return r;
  }, [list, statusFn, typeFilter, assigneeFilter, adminProfileId, user?.is_admin]);

  if (!user?.is_admin) {
    return <Navigate to="/disputes" replace />;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Admin workspace
          </p>
          <h1 className="text-[22px] font-extrabold text-primary font-headline">
            Resolution queue
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Manage platform disputes and arbitration.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/admin/profiles")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-outline-variant/30 bg-white text-[13px] font-semibold hover:bg-surface-container"
          >
            <Shield className="w-4 h-4" />
            Admin profiles
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/register")}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary text-[13px] font-semibold hover:opacity-95"
          >
            <UserPlus className="w-4 h-4" />
            Add admin
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard value={summary.total_open ?? 0} label="Total open" />
          <StatCard
            value={summary.awaiting_review ?? 0}
            label="Awaiting review"
            valueClass="text-amber-500"
          />
          <StatCard
            value={summary.in_mediation ?? 0}
            label="In mediation"
            valueClass="text-violet-600"
          />
          <StatCard
            value={summary.pending_arbitration ?? 0}
            label="Pending arbitration"
            valueClass="text-rose-500"
          />
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/15 p-3 mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ID, user, project…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-surface-container border border-transparent outline-none focus:border-tertiary-fixed-dim text-[13px]"
          />
        </div>
        <SelectPill
          value={statusFilter}
          onChange={setStatusFilter}
          options={USER_STATUS_FILTERS.map((f) => f.label)}
        />
        <SelectPill
          value={typeFilter}
          onChange={setTypeFilter}
          options={["All Types", ...DISPUTE_TYPES.map((t) => t.label)]}
        />
        <SelectPill
          value={assigneeFilter}
          onChange={setAssigneeFilter}
          options={["All", "Assigned to me", "Unassigned"]}
        />
        <button
          type="button"
          onClick={() => load()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-tertiary-fixed-dim/30 text-primary text-[13px] font-semibold border border-outline-variant/30"
        >
          <Filter className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/15 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-ink-700 border-b border-slate-100">
                <Th>ID</Th>
                <Th>Type</Th>
                <Th>Complainant</Th>
                <Th>Respondent</Th>
                <Th>Status</Th>
                <Th>Assigned</Th>
                <Th>Created</Th>
                <Th className="text-right pr-6">Action</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr key={d.id} className="border-b border-slate-50 last:border-0 hover:bg-surface-container-low/70">
                  <Td className="font-medium">{d.display_id || d.id}</Td>
                  <Td>{d.dispute_type_label}</Td>
                  <Td>{d.parties?.complainant?.name}</Td>
                  <Td>{d.parties?.respondent?.name}</Td>
                  <Td>
                    <StatusBadge label={d.status_label} />
                  </Td>
                  <Td>
                    <AssigneePill name={d.assigned_admin?.name} />
                  </Td>
                  <Td>{formatDate(d.created_at)}</Td>
                  <Td className="text-right pr-6">
                    <Link
                      to={`/admin/disputes/${d.id}/review`}
                      className="inline-flex items-center px-3 py-1.5 rounded-md border border-outline-variant/40 text-ink-700 hover:bg-surface-container text-[12px] font-medium"
                    >
                      Review
                    </Link>
                  </Td>
                </tr>
              ))}
              {!error && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-slate-500 py-10">
                    No disputes match filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AssigneePill({ name }) {
  if (!name) {
    return (
      <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500">
        Unassigned
      </span>
    );
  }
  return (
    <span className="inline-flex px-2.5 py-1 rounded-md text-[11px] font-semibold bg-pill-openBg text-pill-openFg">
      {name}
    </span>
  );
}

function Th({ children, className = "" }) {
  return (
    <th className={`px-6 py-3 text-[12px] font-semibold uppercase tracking-wide ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = "" }) {
  return <td className={`px-6 py-3.5 text-ink-700 ${className}`}>{children}</td>;
}

function SelectPill({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pr-8 pl-3 py-2.5 rounded-lg border border-outline-variant/30 bg-white text-[13px] text-ink-700 outline-none focus:border-tertiary-fixed-dim cursor-pointer min-w-[120px]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
    </div>
  );
}
