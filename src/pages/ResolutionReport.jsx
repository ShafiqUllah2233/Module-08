import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { CheckCircle2, Download, FileText, Send } from "lucide-react";
import IntegrationTag from "../components/IntegrationTag";
import Toggle from "../components/Toggle";
import {
  ARBITRATION_OUTCOMES,
  SAMPLE_REPORT_BODY,
  getDisputeById,
} from "../data/mockData";

export default function ResolutionReport() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const dispute = getDisputeById(id);
  const [delivered, setDelivered] = useState(true);
  const [notified, setNotified] = useState(false);

  const outcome = useMemo(() => {
    const wanted = params.get("outcome") || "favour-client";
    return (
      ARBITRATION_OUTCOMES.find((o) => o.id === wanted) ||
      ARBITRATION_OUTCOMES[0]
    );
  }, [params]);

  if (!dispute) {
    return (
      <div className="text-center py-20 text-ink-500">
        Dispute {id} not found.
      </div>
    );
  }

  const generatedDate = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="max-w-[860px] mx-auto">
      {/* Title row */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-ink-900">
            Final Resolution Report
          </h1>
          <p className="text-[13px] text-ink-500 mt-1">
            Review and finalize the report for D-1024.
          </p>
        </div>
        <Link
          to="/admin/queue"
          className="inline-flex items-center px-4 py-2 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-ink-900 hover:bg-lavender-50"
        >
          Back to Admin Queue
        </Link>
      </div>

      {/* Report card */}
      <section className="bg-white rounded-xl shadow-card overflow-hidden">
        {/* Dark navy banner */}
        <div className="bg-navy-900 text-white px-6 py-4 flex items-start justify-between gap-4 flex-wrap">
          <div className="text-[12px] text-white/70">
            Generated on {generatedDate} • Case D-1024
          </div>
          <div className="rounded-md bg-navy-800 px-4 py-2">
            <div className="text-[10px] tracking-wider text-white/60">OUTCOME</div>
            <div className="text-[13px] font-extrabold text-mint-300 mt-0.5">
              {outcome.label}
            </div>
          </div>
        </div>

        {/* Parties block */}
        <div className="px-6 py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-ink-500">
              Complainant (Client)
            </div>
            <div className="mt-1 text-[16px] font-extrabold text-ink-900">
              {dispute.parties.complainant.name}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-ink-500">
              Respondent (Freelancer)
            </div>
            <div className="mt-1 text-[16px] font-extrabold text-ink-900">
              {dispute.parties.respondent.name}
            </div>
          </div>
        </div>

        {/* Report Summary */}
        <div className="px-6 pb-5">
          <div className="rounded-xl border border-slate-100 p-5">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-ink-700" />
              <h2 className="text-[14px] font-bold text-ink-900">
                Report Summary &amp; Reasoning
              </h2>
            </div>
            <pre className="mt-3 text-[12.5px] leading-relaxed text-ink-700 whitespace-pre-wrap font-sans">
              {SAMPLE_REPORT_BODY}
            </pre>
          </div>
        </div>

        {/* Delivered toggle */}
        <div className="px-6 pb-5">
          <div className="flex items-start justify-between gap-4 px-4 py-3 rounded-lg border border-slate-100">
            <div>
              <div className="text-[13px] font-semibold text-ink-900">
                Delivered to Parties
              </div>
              <div className="text-[11px] text-ink-500 mt-0.5">
                Make this report visible in the users&apos; dashboard.
              </div>
            </div>
            <Toggle
              checked={delivered}
              onChange={setDelivered}
              ariaLabel="Delivered to parties"
            />
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 pb-5 flex items-center justify-between gap-3 flex-wrap">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-ink-900 hover:bg-lavender-50">
            <Download className="w-4 h-4" />
            Generate PDF
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <IntegrationTag>Links to G06 — Messaging Infrastructure</IntegrationTag>
            <button
              onClick={() => setNotified(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-[13px] font-semibold"
            >
              <Send className="w-4 h-4" />
              {notified ? "Parties Notified" : "Notify Parties"}
            </button>
          </div>
        </div>
      </section>

      {/* Resolved confirmation */}
      <div className="mt-5 flex justify-center">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 text-[12px] font-semibold border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Case marked as Resolved
        </span>
      </div>
    </div>
  );
}
