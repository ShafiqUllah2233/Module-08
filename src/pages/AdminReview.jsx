import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  ChevronDown,
  FileText,
  Gavel,
  ShieldCheck,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import IntegrationTag from "../components/IntegrationTag";
import {
  STATUSES,
  adminProfiles,
  getDisputeById,
} from "../data/mockData";

export default function AdminReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispute = getDisputeById(id);

  const [assignee, setAssignee] = useState("Admin Sarah (You)");
  const [status, setStatus] = useState(dispute?.status ?? STATUSES.MEDIATION);
  const [reviewed, setReviewed] = useState(false);

  if (!dispute) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-500">Dispute {id} not found.</p>
        <button
          onClick={() => navigate("/admin/queue")}
          className="mt-4 px-4 py-2 rounded-lg bg-navy-900 text-white text-[13px] font-medium"
        >
          Back to Admin Queue
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Title row */}
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[22px] font-extrabold text-ink-900">
              Admin Review: {dispute.id}
            </h1>
            <StatusBadge status={dispute.status} />
            <span className="text-[12px] font-medium text-ink-700">
              {dispute.type}
            </span>
          </div>
          <p className="text-[12px] text-ink-500 mt-1">
            Filed on {dispute.filedOn}
          </p>
        </div>

        {/* Assign Admin dropdown */}
        <div className="bg-white rounded-lg shadow-card px-3 py-2 flex items-center gap-3">
          <span className="text-[12px] text-ink-500">Assign Admin:</span>
          <div className="relative">
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="appearance-none pr-8 pl-2 py-1.5 rounded-md bg-lavender-50 border border-transparent text-[12px] font-semibold text-ink-900 outline-none focus:border-mint-400 cursor-pointer"
            >
              <option>Admin Sarah (You)</option>
              {adminProfiles
                .filter((a) => a.name !== "Admin Sarah" && a.active)
                .map((a) => (
                  <option key={a.id}>{a.name}</option>
                ))}
              <option>Unassigned</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* LEFT */}
        <div className="space-y-5">
          {/* Description (mint left border) */}
          <section className="bg-white rounded-xl shadow-card p-5 border-l-4 border-mint-300">
            <h2 className="text-[15px] font-bold text-ink-900">
              Dispute Description
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-700">
              {dispute.description}
            </p>
          </section>

          {/* Evidence Review */}
          <section className="bg-white rounded-xl shadow-card p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-[15px] font-bold text-ink-900">
                Evidence Review
              </h2>
              <button
                onClick={() => setReviewed((v) => !v)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold border transition-colors ${
                  reviewed
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-mint-300/30 text-emerald-700 border-mint-400/40 hover:bg-mint-300/50"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {reviewed ? "Evidence Reviewed" : "Mark Evidence Reviewed"}
              </button>
            </div>

            <ul className="mt-3 divide-y divide-slate-100">
              {dispute.evidence.map((f) => (
                <li
                  key={f.name}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="w-8 h-8 rounded-md bg-lavender-50 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-ink-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-ink-900 flex items-center gap-2">
                      <span className="truncate">{f.name}</span>
                      {f.hidden && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-mint-300 text-navy-900 text-[10px] font-bold">
                          Hidden from Parties
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-ink-500">
                      {f.size} • Uploaded by {f.uploadedBy}
                    </div>
                  </div>
                  <button className="text-[12px] font-semibold text-ink-700 hover:text-navy-900">
                    Review
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {/* Admin Actions (yellow tinted) */}
          <section className="rounded-xl p-5 bg-amber-50/60 border border-amber-200">
            <h2 className="text-[14px] font-bold text-amber-700">
              Admin Actions
            </h2>

            <div className="mt-4">
              <label className="text-[12px] font-medium text-ink-700">
                Change Status:
              </label>
              <div className="relative mt-1.5 max-w-[420px]">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="appearance-none w-full pr-9 pl-3 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] text-ink-900 outline-none focus:border-mint-400 cursor-pointer"
                >
                  {Object.values(STATUSES).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
              <Link
                to="/admin/queue"
                className="inline-flex items-center px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-ink-900 hover:bg-lavender-50"
              >
                Back to Queue
              </Link>
              <Link
                to={`/admin/disputes/${dispute.id}/arbitration`}
                className="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg"
              >
                <Gavel className="w-4 h-4" />
                Open Arbitration Panel
              </Link>
            </div>
          </section>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          {/* Parties */}
          <section className="bg-white rounded-xl shadow-card p-5">
            <h2 className="text-[15px] font-bold text-ink-900">Parties</h2>
            <div className="mt-3 space-y-3">
              <Party
                party={dispute.parties.complainant}
                tag={
                  <IntegrationTag className="ml-2">
                    Links to G01 — User Identity & Profile
                  </IntegrationTag>
                }
              />
              <Party party={dispute.parties.respondent} />
            </div>
          </section>

          {/* Payment Context (dark card) */}
          <div className="bg-navy-900 text-white rounded-xl p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-mint-300" />
                <span className="text-[13px] font-semibold">
                  Payment Context
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-dashed border-red-300/60 bg-red-500/10 text-[10px] font-medium text-red-200">
                Data from G07
              </span>
            </div>
            <div className="mt-4">
              <div className="text-[11px] text-white/60">Escrow Amount</div>
              <div className="text-[26px] font-extrabold text-mint-300 leading-tight">
                ${dispute.payment.escrow.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[11px] text-white/60">Status</div>
              <div className="text-[13px] font-semibold mt-0.5">
                {dispute.payment.status}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Party({ party, tag }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-lavender-50 text-ink-700 font-bold text-[12px] flex items-center justify-center">
        {party.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-ink-900 flex items-center">
          <span className="truncate">{party.name}</span>
          {tag}
        </div>
        <div className="text-[11px] text-ink-500">{party.role}</div>
      </div>
    </div>
  );
}
