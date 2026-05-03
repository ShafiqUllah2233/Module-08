import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronDown, Filter, Search, Shield } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import {
  DISPUTE_TYPES,
  adminQueueSummary,
  disputes,
} from "../data/mockData";

function StatCard({ value, label, valueClass = "text-ink-900" }) {
  return (
    <div className="bg-white rounded-xl shadow-card px-5 py-4">
      <div className={`text-[28px] leading-none font-extrabold ${valueClass}`}>
        {value}
      </div>
      <div className="mt-2 text-[12px] text-ink-500">{label}</div>
    </div>
  );
}

function AssigneePill({ name }) {
  if (!name) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-ink-400">
        Unassigned
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-pill-openBg text-pill-openFg">
      {name}
    </span>
  );
}

export default function AdminQueue() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [assigneeFilter, setAssigneeFilter] = useState("Assigned to Me");

  const rows = useMemo(() => {
    return disputes.filter((d) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        d.id.toLowerCase().includes(q) ||
        d.project.toLowerCase().includes(q) ||
        d.parties.complainant.name.toLowerCase().includes(q) ||
        d.parties.respondent.name.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "All Statuses" || d.status === statusFilter;
      const matchesType =
        typeFilter === "All Types" || d.type === typeFilter;
      // 'Assigned to Me' is a UI-only demo filter; in production it would
      // compare against the current admin's id.
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [query, statusFilter, typeFilter, assigneeFilter]);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-extrabold text-ink-900">
            Admin Resolution Queue
          </h1>
          <p className="text-[13px] text-ink-500 mt-1">
            Manage platform disputes and arbitration requests.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/profiles")}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] font-semibold text-ink-900 hover:bg-lavender-50"
        >
          <Shield className="w-4 h-4" />
          Admin Accounts
        </button>
      </div>

      {/* KPI cards (with colored numbers per Figma) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard value={adminQueueSummary.totalOpen} label="Total Open" />
        <StatCard
          value={adminQueueSummary.awaitingReview}
          label="Awaiting Review"
          valueClass="text-amber-500"
        />
        <StatCard
          value={adminQueueSummary.inMediation}
          label="In Mediation"
          valueClass="text-violet-500"
        />
        <StatCard
          value={adminQueueSummary.pendingArbitration}
          label="Pending Arbitration"
          valueClass="text-rose-500"
        />
      </div>

      {/* Search + filters */}
      <div className="bg-white rounded-xl shadow-card p-3 mb-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ID, user, or project..."
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
        <SelectPill
          value={assigneeFilter}
          onChange={setAssigneeFilter}
          options={["Assigned to Me", "Unassigned", "All Admins"]}
        />
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
                <Th>ID</Th>
                <Th>Type</Th>
                <Th>Complainant</Th>
                <Th>Respondent</Th>
                <Th>Status</Th>
                <Th>Assigned To</Th>
                <Th>Created</Th>
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
                  <Td>{d.type}</Td>
                  <Td>{d.parties.complainant.name}</Td>
                  <Td>{d.parties.respondent.name}</Td>
                  <Td>
                    <StatusBadge status={d.status} />
                  </Td>
                  <Td>
                    <AssigneePill name={d.assignedTo} />
                  </Td>
                  <Td>{d.created}</Td>
                  <Td className="text-right pr-6">
                    <Link
                      to={`/admin/disputes/${d.id}/review`}
                      className="inline-flex items-center px-3 py-1.5 rounded-md border border-slate-200 text-ink-700 hover:bg-lavender-50 text-[12px] font-medium"
                    >
                      Review
                    </Link>
                  </Td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-ink-500 py-10">
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
