import { useMemo, useState } from "react";
import { Calendar, ChevronDown, Download, Filter, Search } from "lucide-react";
import {
  AUDIT_ACTION_TYPES,
  AUDIT_ENTITY_TYPES,
  adminProfiles,
  auditLog,
} from "../data/mockData";

function ActionPill({ type }) {
  // All action types in the Figma share a violet/purple tone
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-pill-mediationBg text-pill-mediationFg">
      {type}
    </span>
  );
}

export default function AuditLog() {
  const [query, setQuery] = useState("");
  const [admin, setAdmin] = useState("All Admins");
  const [action, setAction] = useState("All Actions");
  const [entity, setEntity] = useState("Dispute");

  const rows = useMemo(() => {
    return auditLog.filter((row) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        row.targetId.toLowerCase().includes(q) ||
        row.details.toLowerCase().includes(q);
      const matchesAdmin = admin === "All Admins" || row.admin === admin;
      const matchesAction =
        action === "All Actions" || row.actionType === action;
      const matchesEntity = entity === row.entityType || entity === "All";
      return matchesQuery && matchesAdmin && matchesAction && matchesEntity;
    });
  }, [query, admin, action, entity]);

  function exportCsv() {
    const header = [
      "Timestamp",
      "Admin",
      "Action Type",
      "Entity Type",
      "Target ID",
      "Details",
    ];
    const lines = [header.join(",")].concat(
      rows.map((r) =>
        [r.ts, r.admin, r.actionType, r.entityType, r.targetId, `"${r.details}"`].join(",")
      )
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
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
          <h1 className="text-[22px] font-extrabold text-ink-900">
            System Audit Log
          </h1>
          <p className="text-[13px] text-ink-500 mt-1">
            Immutable record of all administrative actions taken in the module.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] font-semibold text-ink-900 hover:bg-lavender-50"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-card p-3 mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search details or ID..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-lavender-50 border border-transparent focus:border-mint-400 focus:bg-white outline-none text-[13px] placeholder:text-ink-400"
          />
        </div>

        <SelectPill
          value={admin}
          onChange={setAdmin}
          options={["All Admins", ...adminProfiles.map((a) => a.name)]}
        />
        <SelectPill
          value={action}
          onChange={setAction}
          options={AUDIT_ACTION_TYPES}
        />
        <SelectPill
          value={entity}
          onChange={setEntity}
          options={AUDIT_ENTITY_TYPES}
        />

        <button className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-ink-700 hover:bg-lavender-50">
          <Calendar className="w-4 h-4" />
          Date Range
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-mint-300 hover:bg-mint-400 text-navy-900 text-[13px] font-semibold border border-mint-400/40">
          <Filter className="w-4 h-4" />
          Apply
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-ink-700 border-b border-slate-100">
                <Th>Timestamp</Th>
                <Th>Admin</Th>
                <Th>Action Type</Th>
                <Th>Entity Type</Th>
                <Th>Target ID</Th>
                <Th>Details</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={`${row.ts}-${i}`}
                  className="border-b border-slate-50 last:border-0 hover:bg-lavender-50/50"
                >
                  <Td className="font-medium text-ink-900">{row.ts}</Td>
                  <Td className="font-semibold text-ink-900">{row.admin}</Td>
                  <Td>
                    <ActionPill type={row.actionType} />
                  </Td>
                  <Td>{row.entityType}</Td>
                  <Td className="text-ink-700">{row.targetId}</Td>
                  <Td className="text-ink-500">{row.details}</Td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-ink-500 py-10">
                    No audit entries match your filters.
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
        className="appearance-none pr-8 pl-3 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-ink-700 outline-none focus:border-mint-400 cursor-pointer"
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
