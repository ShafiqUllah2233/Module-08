import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowRight, FileText, MessageSquare, ShieldCheck } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import IntegrationTag from "../components/IntegrationTag";
import { getDisputeById } from "../data/mockData";

export default function DisputeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispute = getDisputeById(id);

  if (!dispute) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-500">Dispute {id} not found.</p>
        <button
          onClick={() => navigate("/disputes")}
          className="mt-4 px-4 py-2 rounded-lg bg-navy-900 text-white text-[13px] font-medium"
        >
          Back to Disputes
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Title row */}
      <div className="mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-[24px] font-extrabold text-ink-900">
            {dispute.id}
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

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* LEFT column */}
        <div className="space-y-5">
          {/* Description */}
          <Card>
            <h2 className="text-[15px] font-bold text-ink-900">Description</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-700">
              {dispute.description}
            </p>
          </Card>

          {/* Evidence Files */}
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-ink-900">
                Evidence Files
              </h2>
              <span className="text-[11px] italic text-ink-500">
                Read-only — submitted at filing
              </span>
            </div>

            <ul className="mt-3 divide-y divide-slate-100">
              {dispute.evidence.length === 0 && (
                <li className="text-[12px] text-ink-500 py-6 text-center">
                  No evidence has been uploaded yet.
                </li>
              )}
              {dispute.evidence.map((f) => (
                <li
                  key={f.name}
                  className="flex items-center gap-3 py-3"
                >
                  <div className="w-8 h-8 rounded-md bg-lavender-50 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-ink-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-ink-900">
                      {f.name}
                    </div>
                    <div className="text-[11px] text-ink-500">
                      {f.size} • Uploaded by {f.uploadedBy}
                    </div>
                  </div>
                  <button className="text-[12px] font-semibold text-ink-700 hover:text-navy-900">
                    View
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          {/* Timeline preview */}
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-ink-900">
                Timeline Preview
              </h2>
              <Link
                to={`/disputes/${dispute.id}/history`}
                className="text-[12px] font-semibold text-ink-700 hover:text-navy-900 inline-flex items-center gap-1"
              >
                View Full History <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <ol className="mt-4 relative pl-4">
              <span className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" />
              {dispute.timeline.map((t, i) => (
                <li key={i} className="relative pb-5 last:pb-0">
                  <span className="absolute -left-[1px] top-1 w-3.5 h-3.5 rounded-full border-2 border-slate-300 bg-white" />
                  <div className="ml-5 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[13px] font-semibold text-ink-900">
                        {t.title}
                      </div>
                      <div className="text-[11px] text-ink-500 mt-0.5">
                        By {t.actor}
                      </div>
                    </div>
                    <span className="text-[11px] text-ink-500 whitespace-nowrap">
                      {t.ts}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        {/* RIGHT column */}
        <div className="space-y-5">
          {/* Parties */}
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-ink-900">Parties</h2>
            </div>
            <div className="mt-3 space-y-3">
              <PartyRow
                party={dispute.parties.complainant}
                tag={
                  <IntegrationTag className="ml-2">
                    Links to G01 — User Identity & Profile
                  </IntegrationTag>
                }
              />
              <PartyRow party={dispute.parties.respondent} />
            </div>
          </Card>

          {/* Project */}
          <Card>
            <h2 className="text-[15px] font-bold text-ink-900">Project</h2>
            <div className="mt-3">
              <div className="text-[13px] font-semibold text-ink-900">
                {dispute.project}
              </div>
              <div className="text-[11px] text-ink-500 mt-0.5">
                Contract ID: {dispute.contractId}
              </div>
              <div className="mt-3">
                <StatusBadge status={dispute.payment.contractStatus} />
              </div>
            </div>
          </Card>

          {/* Payment context (dark card with mint amount) */}
          <div className="bg-navy-900 text-white rounded-xl p-5 shadow-card relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-mint-300" />
                <span className="text-[13px] font-semibold">Payment Context</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-dashed border-red-300/60 bg-red-500/10 text-[10px] font-medium text-red-200">
                Data From G07
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

          {/* Resolution Process CTA */}
          <Card>
            <h3 className="text-[14px] font-bold text-ink-900 text-center">
              Resolution Process
            </h3>
            <p className="text-[12px] text-ink-500 mt-1 text-center">
              Communicate with the other party to resolve this issue through
              mediation.
            </p>
            <Link
              to={`/disputes/${dispute.id}/mediation`}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-navy-900 hover:bg-navy-800 text-white px-4 py-2.5 rounded-lg text-[13px] font-semibold"
            >
              <MessageSquare className="w-4 h-4" />
              Go to Mediation
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}

function PartyRow({ party, tag }) {
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

function Card({ children }) {
  return (
    <section className="bg-white rounded-xl shadow-card p-5">{children}</section>
  );
}
