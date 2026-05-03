import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Filter, Plus, Search } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { DISPUTE_TYPES, disputes, summary } from "../data/mockData";

function StatCard({ value, label }) {
  return (
    <div className="bg-white rounded-xl shadow-card px-5 py-4">
      <div className="text-[28px] leading-none font-extrabold text-ink-900">
        {value}
      </div>
      <div className="mt-2 text-[12px] text-ink-500">{label}</div>
    </div>
  );
}

export default function DisputesList() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [typeFilter, setTypeFilter] = useState("All Types");

  const rows = useMemo(() => {
    return disputes.filter((d) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        d.id.toLowerCase().includes(q) ||
        d.project.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "All Statuses" || d.status === statusFilter;
      const matchesType =
        typeFilter === "All Types" || d.type === typeFilter;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [query, statusFilter, typeFilter]);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-ink-900">
            Your Disputes
          </h1>
          <p className="text-[13px] text-ink-500 mt-1">
            Manage and track your ongoing dispute cases.
          </p>
        </div>
        <button
          onClick={() => navigate("/disputes/new")}
          className="inline-flex items-center gap-2 bg-mint-300 hover:bg-mint-400 text-navy-900 font-semibold text-[13px] px-4 py-2.5 rounded-lg shadow-sm border border-mint-400/40 transition-colors"
        >
          <Plus className="w-4 h-4" />
          File New Dispute
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard value={summary.open} label="Open Disputes" />
        <StatCard value={summary.inMediation} label="In Mediation" />
        <StatCard value={summary.inArbitration} label="In Arbitration" />
        <StatCard value={summary.resolved} label="Resolved" />
      </div>

      {/* Search + filters */}
      <div className="bg-white rounded-xl shadow-card p-3 mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search disputes by ID or project..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-lavender-50 border border-transparent focus:border-mint-400 focus:bg-white outline-none text-[13px] placeholder:text-ink-400"
          />
        </div>

        <SelectPill
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            "All Statuses",
            "Open",
            "Awaiting Review",
            "In Mediation",
            "In Arbitration",
            "Resolved",
          ]}
        />
        <SelectPill
          value={typeFilter}
          onChange={setTypeFilter}
          options={["All Types", ...DISPUTE_TYPES]}
        />
        <button className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-ink-700 hover:bg-lavender-50">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-ink-700 border-b border-slate-100">
                <Th>ID</Th>
                <Th>Project</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Created</Th>
                <Th>Last Updated</Th>
                <Th className="text-right pr-6">Action</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-lavender-50/50"
                >
                  <Td className="font-medium text-ink-900">{d.id}</Td>
                  <Td>{d.project}</Td>
                  <Td>{d.type}</Td>
                  <Td>
                    <StatusBadge status={d.status} />
                  </Td>
                  <Td>{d.created}</Td>
                  <Td>{d.updated}</Td>
                  <Td className="text-right pr-6">
                    <Link
                      to={`/disputes/${d.id}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-md border border-slate-200 text-ink-700 hover:bg-lavender-50 text-[12px] font-medium"
                    >
                      View
                    </Link>
                  </Td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-ink-500 py-10">
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
