import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { CheckCircle2, FileText } from "lucide-react";
import IntegrationTag from "../components/IntegrationTag";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDateTime } from "../utils/format";

export default function ResolutionReport() {
  const { id } = useParams();
  const { user } = useAuth();
  const [report, setReport] = useState(undefined);
  const [decision, setDecision] = useState(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const [rep, dec, d] = await Promise.all([
        apiFetch(`/api/disputes/${id}/report`),
        apiFetch(`/api/disputes/${id}/arbitration`),
        apiFetch(`/api/disputes/${id}`),
      ]);
      setReport(rep);
      setDecision(dec);
      setTitle(d.display_id || `#${id}`);
      setError("");
    } catch (e) {
      setError(e.message || "Failed to load report.");
      setReport(null);
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  if (!user?.is_admin) {
    return <Navigate to="/disputes" replace />;
  }

  async function generate() {
    setBusy(true);
    try {
      await apiFetch(`/api/disputes/${id}/report`, { method: "POST", body: {} });
      await refresh();
    } catch (e) {
      setError(e.message || "Could not generate report.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleDeliver(delivered) {
    if (!report?.id) return;
    setBusy(true);
    try {
      await apiFetch(`/api/reports/${report.id}/deliver`, {
        method: "PATCH",
        body: { delivered_to_parties: delivered },
      });
      await refresh();
    } catch (e) {
      setError(e.message || "Could not update delivery.");
    } finally {
      setBusy(false);
    }
  }

  if (report === undefined) {
    return <div className="text-center py-16 text-slate-500">Loading…</div>;
  }

  return (
    <div className="max-w-[860px] mx-auto">
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-primary font-headline">
            Final resolution report
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            {title} • outcome:{" "}
            <strong>{decision?.outcome_label || decision?.outcome || "—"}</strong>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/admin/queue"
            className="inline-flex items-center px-4 py-2 rounded-lg border border-outline-variant/40 bg-white text-[13px] font-medium hover:bg-surface-container"
          >
            Back to queue
          </Link>
          <button
            type="button"
            disabled={busy || !decision}
            onClick={generate}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-semibold disabled:opacity-50"
          >
            {report ? "Regenerate report" : "Generate report"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-lg">{error}</div>
      )}

      {!report ? (
        <div className="rounded-xl border border-dashed border-outline-variant/50 p-10 text-center text-slate-500">
          {!decision
            ? "Record an arbitration decision first."
            : "No report generated yet."}
        </div>
      ) : (
        <section className="bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/20 overflow-hidden">
          <div className="bg-primary text-on-primary px-6 py-4 flex flex-wrap items-start justify-between gap-4">
            <div className="text-[12px] text-white/80">
              Generated {formatDateTime(report.generated_at)} •{" "}
              <IntegrationTag>Immutable PDF export (future)</IntegrationTag>
            </div>
            <div className="rounded-md bg-primary-container px-4 py-2">
              <div className="text-[10px] tracking-wider text-white/60">ADMIN DECISION</div>
              <div className="text-[13px] font-bold text-tertiary-fixed-dim mt-0.5">
                {report.admin_decision || decision?.outcome_label}
              </div>
            </div>
          </div>

          <div className="px-6 py-6 space-y-6 text-[13px] text-ink-800">
            <ReportBlock heading="Executive summary" body={report.dispute_summary} />
            <ReportBlock heading="Evidence" body={report.evidence_summary} />
            <ReportBlock heading="Mediation" body={report.mediation_summary} />
            <ReportBlock heading="Notes" body={report.decision_notes} />
          </div>

          <div className="px-6 py-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <label className="flex items-center gap-2 text-[13px] cursor-pointer">
              <input
                type="checkbox"
                checked={!!report.delivered_to_parties}
                disabled={busy}
                onChange={(e) => toggleDeliver(e.target.checked)}
              />
              Deliver to parties portal
              {report.delivered_to_parties && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </label>
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <FileText className="w-4 h-4" />
              Persisted dispute #{id}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function ReportBlock({ heading, body }) {
  return (
    <div>
      <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-400">
        {heading}
      </h3>
      <p className="mt-2 whitespace-pre-wrap leading-relaxed">{body || "—"}</p>
    </div>
  );
}
