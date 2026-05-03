import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, ArrowRight, Check } from "lucide-react";
import IntegrationTag from "../components/IntegrationTag";
import { ARBITRATION_OUTCOMES, getDisputeById } from "../data/mockData";

export default function ArbitrationDecision() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispute = getDisputeById(id);

  const [outcome, setOutcome] = useState(ARBITRATION_OUTCOMES[0].id);
  const [notes, setNotes] = useState("");
  const [triggerPayment, setTriggerPayment] = useState(true);

  if (!dispute) {
    return (
      <div className="text-center py-20 text-ink-500">
        Dispute {id} not found.
      </div>
    );
  }

  function submit(e) {
    e.preventDefault();
    // FR-DR-22..27: record decision and route to the resolution report screen.
    navigate(`/admin/disputes/${dispute.id}/resolution?outcome=${outcome}`);
  }

  return (
    <div className="max-w-[1080px] mx-auto">
      <Link
        to={`/admin/disputes/${dispute.id}/review`}
        className="inline-flex items-center gap-1.5 text-[12px] text-ink-500 hover:text-ink-700"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Review
      </Link>

      <h1 className="mt-2 text-[22px] font-extrabold text-ink-900">
        Arbitration Decision
      </h1>
      <p className="text-[13px] text-ink-500 mt-1 mb-6">
        Make a final, binding ruling on dispute D-1024.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        {/* Form (red border) */}
        <form
          onSubmit={submit}
          className="rounded-xl border border-rose-300 bg-white shadow-card overflow-hidden"
        >
          {/* Official ruling header */}
          <div className="px-5 py-4 bg-rose-50/60 border-b border-rose-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h2 className="text-[15px] font-bold text-rose-600">
                Official Ruling
              </h2>
            </div>
            <p className="text-[12px] text-ink-500 mt-1">
              This decision is final and will be recorded in the system audit
              log.
            </p>
          </div>

          <div className="p-5">
            {/* 1. Outcome */}
            <h3 className="text-[14px] font-bold text-ink-900">
              1. Arbitration Outcome
            </h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              {ARBITRATION_OUTCOMES.map((o) => {
                const selected = outcome === o.id;
                return (
                  <label
                    key={o.id}
                    className={`flex items-start gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                      selected
                        ? "border-mint-400 bg-mint-300/10"
                        : "border-slate-200 hover:bg-lavender-50"
                    }`}
                  >
                    <span
                      className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selected ? "border-navy-900" : "border-slate-300"
                      }`}
                    >
                      {selected && (
                        <span className="w-2 h-2 rounded-full bg-navy-900" />
                      )}
                    </span>
                    <input
                      type="radio"
                      className="sr-only"
                      name="outcome"
                      value={o.id}
                      checked={selected}
                      onChange={() => setOutcome(o.id)}
                    />
                    <div>
                      <div className="text-[13px] font-semibold text-ink-900">
                        {o.title}
                      </div>
                      <div className="text-[11px] text-ink-500 mt-0.5">
                        {o.subtitle}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {/* 2. Notes */}
            <h3 className="mt-6 text-[14px] font-bold text-ink-900">
              2. Decision Notes &amp; Reasoning
            </h3>
            <p className="text-[11px] text-ink-500 mt-1">
              This reasoning will be visible to both parties in the final
              resolution report.
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              placeholder="Enter the detailed rationale for this decision..."
              className="mt-2 w-full px-3 py-2.5 rounded-lg bg-lavender-50 border border-transparent focus:border-mint-400 focus:bg-white outline-none text-[13px] resize-y"
            />

            {/* Payment signal */}
            <div className="mt-5 flex items-start gap-3">
              <button
                type="button"
                onClick={() => setTriggerPayment((v) => !v)}
                className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  triggerPayment
                    ? "bg-navy-900 border-navy-900"
                    : "border-slate-300"
                }`}
                aria-pressed={triggerPayment}
                aria-label="Trigger payment signal"
              >
                {triggerPayment && (
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                )}
              </button>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-ink-900">
                    Trigger Payment Signal
                  </span>
                  <IntegrationTag>Links to G07 — Payment Gateway</IntegrationTag>
                </div>
                <p className="text-[11px] text-ink-500 mt-1 leading-relaxed">
                  Automatically trigger the escrow release or refund based on
                  the outcome selected above via the payment gateway API.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
              <Link
                to={`/admin/disputes/${dispute.id}/review`}
                className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-ink-900 hover:bg-lavender-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-[13px] font-semibold"
              >
                Submit Decision
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>

        {/* RIGHT column */}
        <div className="space-y-5">
          {/* Escrow Context (dark) */}
          <div className="bg-navy-900 text-white rounded-xl p-5 shadow-card">
            <div className="text-[13px] font-semibold text-mint-300">
              Escrow Context
            </div>
            <div className="mt-3 text-[11px] text-white/60">
              Amount in Escrow
            </div>
            <div className="text-[24px] font-extrabold text-white leading-tight">
              ${dispute.payment.escrow.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </div>
            <div className="mt-3 text-[11px] text-white/60">Project</div>
            <div className="text-[13px] font-semibold mt-0.5">
              {dispute.project}
            </div>
          </div>

          {/* Parties */}
          <section className="bg-white rounded-xl shadow-card p-5">
            <h3 className="text-[14px] font-bold text-ink-900">Parties</h3>
            <div className="mt-3">
              <div className="text-[11px] text-ink-500">
                {dispute.parties.complainant.role}
              </div>
              <div className="text-[14px] font-semibold text-ink-900">
                {dispute.parties.complainant.name}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[11px] text-ink-500">
                {dispute.parties.respondent.role}
              </div>
              <div className="text-[14px] font-semibold text-ink-900">
                {dispute.parties.respondent.name}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
