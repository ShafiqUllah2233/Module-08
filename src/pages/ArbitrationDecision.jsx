import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import IntegrationTag from "../components/IntegrationTag";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ARBITRATION_OUTCOMES } from "../constants/dispute";

export default function ArbitrationDecision() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [disputeLabel, setDisputeLabel] = useState("");
  const [existing, setExisting] = useState(null);
  const [outcome, setOutcome] = useState("favour_client");
  const [notes, setNotes] = useState("");
  const [triggerPayment, setTriggerPayment] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [d, dec] = await Promise.all([
          apiFetch(`/api/disputes/${id}`),
          apiFetch(`/api/disputes/${id}/arbitration`),
        ]);
        setDisputeLabel(d.display_id || `#${id}`);
        setExisting(dec || null);
        if (dec?.outcome) setOutcome(dec.outcome);
      } catch (e) {
        setError(e.message || "Load failed.");
      }
    })();
  }, [id]);

  if (!user?.is_admin) {
    return <Navigate to="/disputes" replace />;
  }

  async function submit(e) {
    e.preventDefault();
    if (!notes.trim()) {
      setError("Decision notes are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiFetch(`/api/disputes/${id}/arbitration`, {
        method: "POST",
        body: {
          outcome,
          decision_notes: notes.trim(),
          payment_signal_sent: triggerPayment,
        },
      });
      navigate(`/admin/disputes/${id}/resolution`);
    } catch (err) {
      setError(err.message || "Submission failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-[1080px] mx-auto">
      <Link
        to={`/admin/disputes/${id}/review`}
        className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-primary"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to review
      </Link>

      <h1 className="mt-2 text-[22px] font-extrabold text-primary font-headline">
        Arbitration decision
      </h1>
      <p className="text-[13px] text-slate-500 mt-1 mb-6">
        Case {disputeLabel}. This records a binding ruling.
      </p>

      {existing && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-[13px] px-4 py-3">
          A decision already exists:{" "}
          <strong>{existing.outcome_label || existing.outcome}</strong>. You can still regenerate
          the resolution report afterwards.
          <IntegrationTag className="ml-2">Audit logged</IntegrationTag>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <form
        onSubmit={submit}
        className="rounded-xl border border-rose-200 bg-surface-container-lowest shadow-card overflow-hidden"
      >
        <div className="px-5 py-4 bg-rose-50/80 border-b border-rose-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h2 className="text-[15px] font-bold text-rose-700 font-headline">
              Official ruling
            </h2>
          </div>
          <p className="text-[12px] text-slate-600 mt-1">
            Final outcomes are mirrored to escrow workflows (demo signal only).
          </p>
        </div>

        <div className="p-5">
          <h3 className="text-[14px] font-bold text-ink-900">1. Outcome</h3>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {ARBITRATION_OUTCOMES.map((o) => {
              const selected = outcome === o.id;
              return (
                <label
                  key={o.id}
                  className={`flex items-start gap-3 px-4 py-3 rounded-lg border cursor-pointer ${
                    selected
                      ? "border-tertiary-fixed-dim bg-surface-container"
                      : "border-slate-200 hover:bg-surface-container-low"
                  }`}
                >
                  <span
                    className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      selected ? "border-primary" : "border-slate-300"
                    }`}
                  >
                    {selected && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </span>
                  <input
                    type="radio"
                    className="sr-only"
                    checked={selected}
                    onChange={() => setOutcome(o.id)}
                  />
                  <span className="text-[13px] text-ink-900">{o.label}</span>
                </label>
              );
            })}
          </div>

          <h3 className="text-[14px] font-bold text-ink-900 mt-8">2. Decision notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={6}
            className="mt-3 w-full rounded-lg border border-outline-variant/40 px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-tertiary-fixed-dim"
            placeholder="Legal reasoning summarised…"
          />

          <label className="mt-6 flex items-center gap-2 text-[13px] cursor-pointer">
            <input
              type="checkbox"
              checked={triggerPayment}
              onChange={(e) => setTriggerPayment(e.target.checked)}
            />
            Send payment / escrow signal to G07 downstream
          </label>

          <div className="mt-8 flex justify-end gap-3">
            <Link
              to={`/admin/disputes/${id}/review`}
              className="px-5 py-2.5 rounded-lg border border-outline-variant/40 text-[13px] font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={busy}
              className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-semibold text-[13px] disabled:opacity-50"
            >
              {busy ? "Recording…" : "Record decision"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
