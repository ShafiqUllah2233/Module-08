import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  FileText,
  MessageSquare,
  ShieldCheck,
  Download,
} from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import IntegrationTag from "../components/IntegrationTag";
import { apiFetch, downloadEvidence } from "../api/client";

export default function DisputeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dispute, setDispute] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await apiFetch(`/api/disputes/${id}`);
        if (!cancelled) {
          setDispute(data);
          setError("");
        }
      } catch (e) {
        if (!cancelled) {
          setDispute(null);
          setError(e.message || "Not found.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-20 text-slate-500">
        Loading dispute…
      </div>
    );
  }

  if (!dispute || error) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">{error || `Dispute ${id} not found.`}</p>
        <button
          type="button"
          onClick={() => navigate("/disputes")}
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-medium"
        >
          Back to disputes
        </button>
      </div>
    );
  }

  const timeline = dispute.history?.length
    ? dispute.history.slice(-5).reverse()
    : [];

  return (
    <div>
      <div className="mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-[24px] font-extrabold text-primary font-headline">
            {dispute.display_id || `#${dispute.id}`}
          </h1>
          <StatusBadge label={dispute.status_label} />
          <span className="text-[12px] font-medium text-slate-600">
            {dispute.dispute_type_label}
          </span>
        </div>
        <p className="text-[12px] text-slate-500 mt-1">
          Filed on {dispute.created_at?.slice?.(0, 10)}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <Card>
            <h2 className="text-[15px] font-bold text-ink-900 font-headline">Description</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-700 whitespace-pre-wrap">
              {dispute.description}
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-ink-900 font-headline">
                Evidence files
              </h2>
            </div>
            <ul className="mt-3 divide-y divide-slate-100">
              {(dispute.evidence || []).length === 0 && (
                <li className="text-[12px] text-ink-500 py-6 text-center">
                  No uploaded evidence yet.
                </li>
              )}
              {(dispute.evidence || []).map((f) => (
                <li key={f.id} className="flex items-center gap-3 py-3">
                  <div className="w-8 h-8 rounded-md bg-surface-container flex items-center justify-center">
                    <FileText className="w-4 h-4 text-ink-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-ink-900 flex flex-wrap gap-2 items-center">
                      <span className="truncate">{f.file_name}</span>
                      {!f.is_visible_to_parties && (
                        <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          Restricted visibility
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-ink-500">
                      {f.file_size_kb} KB • {f.uploaded_by?.name}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      downloadEvidence(f.id, f.file_name).catch((err) =>
                        alert(err.message)
                      )
                    }
                    className="inline-flex items-center gap-1 text-[12px] font-semibold text-primary hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-ink-900 font-headline">
                Recent timeline
              </h2>
              <Link
                to={`/disputes/${dispute.id}/history`}
                className="text-[12px] font-semibold text-primary inline-flex items-center gap-1"
              >
                Full history <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <ol className="mt-4 relative pl-4">
              <span className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" />
              {timeline.length === 0 && (
                <li className="text-[12px] text-slate-500 py-4">No history yet.</li>
              )}
              {timeline.map((t) => (
                <li key={t.id} className="relative pb-5 last:pb-0">
                  <span className="absolute -left-[1px] top-1 w-3.5 h-3.5 rounded-full border-2 border-slate-300 bg-white" />
                  <div className="ml-5">
                    <div className="text-[13px] font-semibold text-ink-900">
                      {t.old_status_label} → {t.new_status_label}
                    </div>
                    <div className="text-[11px] text-ink-500 mt-0.5">
                      {t.changed_by?.name} • {t.changed_at?.replace("T", " ").slice(0, 16)}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <h2 className="text-[15px] font-bold text-ink-900 font-headline">Parties</h2>
            <div className="mt-3 space-y-3">
              <PartyRow
                party={dispute.parties.complainant}
                tag={
                  <IntegrationTag className="ml-2">G01 — Identity</IntegrationTag>
                }
              />
              <PartyRow party={dispute.parties.respondent} />
            </div>
          </Card>

          <Card>
            <h2 className="text-[15px] font-bold text-ink-900 font-headline">Project</h2>
            <div className="mt-3">
              <div className="text-[13px] font-semibold text-ink-900">
                {dispute.project_title}
              </div>
              <div className="text-[11px] text-ink-500 mt-0.5">Project #{dispute.project_id}</div>
              <div className="mt-3">
                <StatusBadge label={dispute.contract_status} />
              </div>
            </div>
          </Card>

          <div className="bg-primary text-on-primary rounded-xl p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-tertiary-fixed-dim" />
                <span className="text-[13px] font-semibold">Payment context</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-[11px] text-white/60">Escrow amount</div>
              <div className="text-[26px] font-extrabold text-tertiary-fixed-dim leading-tight">
                $
                {(dispute.payment?.escrow ?? 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[11px] text-white/60">Status</div>
              <div className="text-[13px] font-semibold mt-0.5">
                {dispute.payment?.status}
              </div>
            </div>
          </div>

          <Card>
            <h3 className="text-[14px] font-bold text-ink-900 text-center font-headline">
              Resolution process
            </h3>
            <p className="text-[12px] text-ink-500 mt-1 text-center">
              Communicate with the other party in mediation.
            </p>
            <Link
              to={`/disputes/${dispute.id}/mediation`}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-primary hover:opacity-95 text-on-primary px-4 py-2.5 rounded-lg text-[13px] font-semibold"
            >
              <MessageSquare className="w-4 h-4" />
              Mediation room
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
      <div className="w-9 h-9 rounded-full bg-surface-container text-ink-700 font-bold text-[12px] flex items-center justify-center">
        {party.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-ink-900 flex items-center flex-wrap">
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
    <section className="bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/15 p-5">
      {children}
    </section>
  );
}
