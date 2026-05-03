import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Clock, Send } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import IntegrationTag from "../components/IntegrationTag";
import { getDisputeById } from "../data/mockData";

export default function MediationRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispute = getDisputeById(id);
  const [draft, setDraft] = useState("");
  const [log, setLog] = useState(dispute?.mediation?.log || []);

  if (!dispute) {
    return (
      <div className="text-center py-20">
        <p className="text-ink-500">Dispute {id} not found.</p>
      </div>
    );
  }

  function send() {
    if (!draft.trim()) return;
    setLog((prev) => [
      ...prev,
      {
        author: "Alice Smith",
        ts: new Date().toLocaleString("en-CA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        text: draft.trim(),
        self: true,
      },
    ]);
    setDraft("");
  }

  function escalate() {
    // Navigates back to the case; in production this would call FR-DR-19/27.
    navigate(`/disputes/${dispute.id}`);
  }

  return (
    <div className="max-w-[1080px] mx-auto">
      {/* Back link + title */}
      <div className="mb-5">
        <Link
          to={`/disputes/${dispute.id}`}
          className="inline-flex items-center gap-1.5 text-[12px] text-ink-500 hover:text-ink-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dispute D-1024
        </Link>
        <h1 className="mt-2 text-[22px] font-extrabold text-ink-900">
          Mediation Room
        </h1>
        <p className="text-[13px] text-ink-500 mt-1">
          Communicate directly to reach a resolution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
        {/* Mediation log card */}
        <section className="bg-white rounded-xl shadow-card flex flex-col min-h-[520px]">
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
            <div className="text-[13px] font-semibold text-ink-900">
              Mediation Log
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-pill-reviewBg text-pill-reviewFg text-[11px] font-semibold">
              <Clock className="w-3 h-3" />
              {dispute.mediation?.daysRemaining ?? 0} days remaining
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 px-5 py-5 space-y-4 overflow-y-auto">
            {log.map((m, i) =>
              m.system ? (
                <div key={i} className="text-center">
                  <span className="inline-block text-[11px] text-ink-500 bg-lavender-50 rounded-md px-2.5 py-1">
                    {m.text} • {m.ts}
                  </span>
                </div>
              ) : m.self ? (
                <SelfBubble key={i} m={m} />
              ) : (
                <OtherBubble key={i} m={m} />
              )
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-slate-100 px-5 py-4">
            <div className="flex justify-end mb-2">
              <IntegrationTag>Links to G06 — Messaging</IntegrationTag>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                placeholder="Type your message..."
                className="w-full px-3 py-2.5 outline-none text-[13px] resize-none rounded-lg"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
                }}
              />
              <div className="flex items-center justify-between px-3 pb-3">
                <span className="text-[11px] text-ink-400">
                  Messages cannot be edited once sent.
                </span>
                <button
                  onClick={send}
                  className="inline-flex items-center gap-2 bg-navy-900 hover:bg-navy-800 text-white px-3.5 py-2 rounded-lg text-[12px] font-semibold"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Side panel */}
        <aside className="space-y-5">
          <section className="bg-white rounded-xl shadow-card p-5">
            <h3 className="text-[14px] font-bold text-ink-900">Mediation Info</h3>

            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-wide text-ink-500">
                Status
              </div>
              <div className="mt-1.5">
                <StatusBadge status={dispute.mediation?.status || "Active"} />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-[11px] uppercase tracking-wide text-ink-500">
                Deadline
              </div>
              <div className="mt-1 text-[13px] font-semibold text-ink-900">
                {dispute.mediation?.deadline || "—"}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="text-[12px] font-semibold text-ink-900">
                Can&apos;t reach an agreement?
              </div>
              <p className="text-[11px] text-ink-500 mt-1 leading-relaxed">
                If mediation fails, you can escalate this case to an admin
                arbitrator who will make a final binding decision.
              </p>
              <button
                onClick={escalate}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 text-[12px] font-semibold"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Escalate to Arbitration
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function SelfBubble({ m }) {
  return (
    <div className="flex flex-col items-end">
      <div className="text-[11px] text-ink-500 mb-1">
        <span className="font-semibold text-ink-700">{m.author}</span>{" "}
        <span>{m.ts}</span>
      </div>
      <div className="bg-navy-900 text-white rounded-2xl rounded-tr-md px-4 py-2.5 text-[13px] max-w-[70%]">
        {m.text}
      </div>
    </div>
  );
}

function OtherBubble({ m }) {
  return (
    <div className="flex flex-col items-start">
      <div className="text-[11px] text-ink-500 mb-1">
        <span className="font-semibold text-ink-700">{m.author}</span>{" "}
        <span>{m.ts}</span>
      </div>
      <div className="bg-lavender-50 text-ink-900 rounded-2xl rounded-tl-md px-4 py-2.5 text-[13px] max-w-[70%]">
        {m.text}
      </div>
    </div>
  );
}
