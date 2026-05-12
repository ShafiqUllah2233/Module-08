import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Clock, Send } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatDateTime } from "../utils/format";

export default function MediationRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dispute, setDispute] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    try {
      const [d, log] = await Promise.all([
        apiFetch(`/api/disputes/${id}`),
        apiFetch(`/api/disputes/${id}/mediation`),
      ]);
      setDispute(d);
      setMessages(log || []);
      setError("");
    } catch (e) {
      setError(e.message || "Cannot load mediation.");
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true);
    try {
      await apiFetch(`/api/disputes/${id}/mediation`, {
        method: "POST",
        body: { statement: text },
      });
      setDraft("");
      await refresh();
    } catch (e) {
      setError(e.message || "Could not send.");
    } finally {
      setBusy(false);
    }
  }

  async function escalate() {
    if (!confirm("Escalate this case to arbitration?")) return;
    setBusy(true);
    try {
      await apiFetch(`/api/disputes/${id}/escalate`, { method: "POST" });
      navigate(`/disputes/${id}`);
    } catch (e) {
      setError(e.message || "Escalation failed.");
    } finally {
      setBusy(false);
    }
  }

  const deadline = dispute?.mediation_deadline;
  const deadlineLabel = deadline ? formatDateTime(deadline) : "—";

  const canEscalate = !user?.is_admin;

  return (
    <div className="max-w-[1080px] mx-auto">
      <div className="mb-5">
        <Link
          to={`/disputes/${id}`}
          className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-primary"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to dispute
        </Link>
        <h1 className="mt-2 text-[22px] font-extrabold text-primary font-headline">
          Mediation room
        </h1>
        <p className="text-[13px] text-slate-500 mt-1">
          {dispute ? (
            <>
              {dispute.display_id} · <StatusBadge label={dispute.status_label} />
            </>
          ) : (
            "Loading…"
          )}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        <section className="bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/15 flex flex-col min-h-[480px]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <div className="text-[13px] font-semibold text-ink-900">Mediation log</div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-pill-reviewBg text-pill-reviewFg text-[11px] font-semibold">
              <Clock className="w-3 h-3" />
              Deadline {deadlineLabel}
            </span>
          </div>
          <div className="flex-1 px-5 py-5 space-y-4 overflow-y-auto max-h-[420px]">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.author?.id ? "justify-start" : "justify-center"}`}
              >
                <div className="max-w-[85%] rounded-xl px-4 py-2.5 bg-surface-container border border-outline-variant/20">
                  <div className="text-[11px] text-slate-500">
                    {m.author?.name || "Party"} ·{" "}
                    {m.submitted_at?.replace("T", " ").slice(0, 16)}
                  </div>
                  <p className="text-[13px] text-ink-900 mt-1 whitespace-pre-wrap">
                    {m.statement}
                  </p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <p className="text-center text-[13px] text-slate-500 py-8">
                No statements yet. Start the conversation.
              </p>
            )}
          </div>
          <div className="border-t border-slate-100 px-5 py-4">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder="Your statement…"
              className="w-full rounded-lg bg-surface-container border border-transparent px-3 py-2 text-[13px] outline-none focus:border-tertiary-fixed-dim resize-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                disabled={busy || !draft.trim()}
                onClick={send}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-semibold disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </section>

        <aside className="rounded-xl border border-amber-200 bg-amber-50/80 p-5 h-fit">
          <div className="flex gap-2 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h2 className="text-[13px] font-bold text-amber-900">Escalation</h2>
              <p className="text-[12px] text-amber-900/80 mt-1">
                If mediation fails, the dispute party may escalate to binding arbitration.
              </p>
              {canEscalate ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={escalate}
                  className="mt-4 w-full py-2.5 rounded-lg border border-amber-300 bg-white text-amber-900 text-[12px] font-bold uppercase tracking-wide hover:bg-amber-100"
                >
                  Escalate to arbitration
                </button>
              ) : (
                <div className="mt-4 text-[12px] text-amber-900/90 bg-white border border-amber-200 rounded-lg px-3 py-2">
                  Escalation is done by dispute users, not admins.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
