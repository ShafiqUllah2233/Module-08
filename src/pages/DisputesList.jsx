import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Filter, Plus, Search } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { DISPUTE_TYPES, USER_STATUS_FILTERS } from "../constants/dispute";
import { formatDate, mergeDisputesById } from "../utils/format";

function StatCard({ value, label }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-card px-5 py-4 border border-outline-variant/15">
      <div className="text-[28px] leading-none font-extrabold text-primary font-headline">
        {value}
      </div>
      <div className="mt-2 text-[12px] text-slate-500">{label}</div>
    </div>
  );
}

export default function DisputesList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canFileDispute = !user?.is_admin;
  const [list, setList] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [typeFilter, setTypeFilter] = useState("All Types");

  const load = useCallback(async () => {
    if (!user?.id) return;
    const uid = user.id;
    const qParam = query.trim() ? `&q=${encodeURIComponent(query.trim())}` : "";
    let typeParam = "";
    const typeOpt = DISPUTE_TYPES.find((t) => t.label === typeFilter);
    if (typeOpt) typeParam = `&type=${encodeURIComponent(typeOpt.value)}`;

    try {
      const [asComplainant, asRespondent] = await Promise.all([
        apiFetch(`/api/disputes?complainant_id=${uid}${qParam}${typeParam}`),
        apiFetch(`/api/disputes?respondent_id=${uid}${qParam}${typeParam}`),
      ]);
      setList(mergeDisputesById(asComplainant, asRespondent));
      setLoadError("");
    } catch (e) {
      setLoadError(e.message || "Failed to load disputes.");
      setList([]);
    }
  }, [user?.id, query, typeFilter]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const statusFn = useMemo(
    () => USER_STATUS_FILTERS.find((f) => f.label === statusFilter)?.match || (() => true),
    [statusFilter]
  );

  const rows = useMemo(() => list.filter((d) => statusFn(d.status)), [list, statusFn]);

  const kpis = useMemo(() => {
    const open = list.filter((d) =>
      ["submitted", "evidence_uploaded", "under_review"].includes(d.status)
    ).length;
    const inMediation = list.filter((d) => d.status === "mediation").length;
    const inArb = list.filter((d) => d.status === "admin_arbitration").length;
    const resolved = list.filter((d) => d.status === "resolution_completed").length;
    return { open, inMediation, inArb, resolved };
  }, [list]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
            Overview
          </p>
          <h1 className="text-[22px] font-extrabold text-primary font-headline">
            Your disputes
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Cases where you are complainant or respondent.
          </p>
        </div>
        {canFileDispute ? (
          <button
            type="button"
            onClick={() => navigate("/disputes/new")}
            className="inline-flex items-center justify-center gap-2 bg-primary text-on-primary font-bold text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-lg shadow hover:opacity-95"
          >
            <Plus className="w-4 h-4" />
            File new dispute
          </button>
        ) : (
          <div className="text-[12px] text-slate-500 max-w-[240px] text-right">
            Admin accounts can review and resolve disputes, but cannot file new ones.
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard value={kpis.open} label="Open" />
        <StatCard value={kpis.inMediation} label="In mediation" />
        <StatCard value={kpis.inArb} label="In arbitration" />
        <StatCard value={kpis.resolved} label="Resolved" />
      </div>

      {loadError && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {loadError}
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl shadow-card p-3 mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center border border-outline-variant/15">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, parties, or ID…"
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-surface-container border border-transparent focus:border-tertiary-fixed-dim outline-none text-[13px]"
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
        <button
          type="button"
          onClick={() => load()}
          className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border border-outline-variant/30 bg-white text-[13px] text-ink-700 hover:bg-surface-container"
        >
          <Filter className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-card overflow-hidden border border-outline-variant/15">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-ink-700 border-b border-slate-100">
                <Th>ID</Th>
                <Th>Project</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th>Updated</Th>
                <Th className="text-right pr-6">Action</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-surface-container-low/80"
                >
                  <Td className="font-medium text-ink-900">{d.display_id || d.id}</Td>
                  <Td>{d.project_title}</Td>
                  <Td>{d.dispute_type_label}</Td>
                  <Td>
                    <StatusBadge label={d.status_label} />
                  </Td>
                  <Td>{formatDate(d.created_at)}</Td>
                  <Td>{formatDate(d.updated_at)}</Td>
                  <Td className="text-right pr-6">
                    <Link
                      to={`/disputes/${d.id}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-md border border-outline-variant/40 text-ink-700 hover:bg-surface-container text-[12px] font-semibold"
                    >
                      View
                    </Link>
                  </Td>
                </tr>
              ))}
              {!loadError && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-slate-500 py-12">
                    No disputes match your filters.
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

function Th({ children, className = "" }) {
  return (
    <th
      className={`px-6 py-3 text-[12px] font-semibold uppercase tracking-wide ${className}`}
    >
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
        className="appearance-none pr-8 pl-3 py-2.5 rounded-lg border border-outline-variant/30 bg-white text-[13px] text-ink-700 outline-none focus:border-tertiary-fixed-dim cursor-pointer min-w-[140px]"
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
