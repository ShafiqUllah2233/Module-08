import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  FileText,
  Gavel,
  ShieldCheck,
  Download,
} from "lucide-react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import IntegrationTag from "../components/IntegrationTag";
import { apiFetch, downloadEvidence } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { ADMIN_STATUS_OPTIONS } from "../constants/dispute";

export default function AdminReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dispute, setDispute] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [assignId, setAssignId] = useState("");
  const [statusSel, setStatusSel] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [evBusy, setEvBusy] = useState(null);

  const load = useCallback(async () => {
    try {
      const [d, al] = await Promise.all([
        apiFetch(`/api/disputes/${id}`),
        apiFetch("/api/admins"),
      ]);
      setDispute(d);
      setAdmins(al || []);
      const cur = d.assigned_admin?.id;
      setAssignId(cur ? String(cur) : "");
      setStatusSel(d.status || "");
      setError("");
    } catch (e) {
      setDispute(null);
      setError(e.message || "Failed to load dispute.");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (!user?.is_admin) {
    return <Navigate to="/disputes" replace />;
  }

  if (error && !dispute) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">{error}</p>
        <button
          type="button"
          onClick={() => navigate("/admin/queue")}
          className="mt-4 px-4 py-2 rounded-lg bg-primary text-on-primary text-[13px] font-medium"
        >
          Back to queue
        </button>
      </div>
    );
  }

  if (!dispute) {
    return <div className="text-center py-20 text-slate-500">Loading…</div>;
  }

  async function saveAdminFields() {
    setSaving(true);
    setError("");
    try {
      const adminId =
        assignId === "" || assignId === "__none__" ? null : parseInt(assignId, 10);
      await apiFetch(`/api/disputes/${id}/assign`, {
        method: "PATCH",
        body: { admin_id: adminId },
      });
      await apiFetch(`/api/disputes/${id}/status`, {
        method: "PATCH",
        body: { status: statusSel },
      });
      await load();
    } catch (e) {
      setError(e.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function markEvidenceReviewed(evId) {
    setEvBusy(evId);
    try {
      await apiFetch(`/api/evidence/${evId}/review`, { method: "POST" });
      await load();
    } catch (e) {
      alert(e.message || "Failed");
    } finally {
      setEvBusy(null);
    }
  }

  const evidence = dispute.evidence || [];

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-5 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[22px] font-extrabold text-primary font-headline">
              Admin review · {dispute.display_id || id}
            </h1>
            <StatusBadge label={dispute.status_label} />
            <span className="text-[12px] font-medium text-slate-600">
              {dispute.dispute_type_label}
            </span>
          </div>
          <p className="text-[12px] text-slate-500 mt-1">
            Filed {dispute.created_at?.slice(0, 10)}
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-lg shadow-card border border-outline-variant/20 px-3 py-2 flex flex-col gap-2 min-w-[220px]">
          <span className="text-[11px] text-slate-500 font-semibold uppercase">
            Assignment & status
          </span>
          <label className="text-[11px] text-slate-600">Assign admin</label>
          <div className="relative">
            <select
              value={assignId === "" ? "__none__" : assignId}
              onChange={(e) =>
                setAssignId(e.target.value === "__none__" ? "" : e.target.value)
              }
              className="appearance-none w-full pr-8 pl-2 py-2 rounded-md bg-surface-container border border-outline-variant/30 text-[12px] font-semibold outline-none cursor-pointer"
            >
              <option value="__none__">Unassigned</option>
              {admins
                .filter((a) => a.is_active)
                .map((a) => (
                  <option key={a.id} value={String(a.id)}>
                    {a.name}
                  </option>
                ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <label className="text-[11px] text-slate-600">Canonical status</label>
          <div className="relative">
            <select
              value={statusSel}
              onChange={(e) => setStatusSel(e.target.value)}
              className="appearance-none w-full pr-8 pl-2 py-2 rounded-md bg-surface-container border border-outline-variant/30 text-[12px] outline-none cursor-pointer"
            >
              {ADMIN_STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label} ({o.value})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={saveAdminFields}
            className="mt-2 py-2 rounded-lg bg-primary text-on-primary text-[11px] font-bold uppercase tracking-wide disabled:opacity-50"
          >
            {saving ? "Saving…" : "Apply"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 px-4 py-2 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <section className="bg-white rounded-xl shadow-card p-5 border-l-4 border-tertiary-fixed-dim border-y border-r border-outline-variant/15">
            <h2 className="text-[15px] font-bold text-ink-900 font-headline">
              Dispute description
            </h2>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-700 whitespace-pre-wrap">
              {dispute.description}
            </p>
          </section>

          <section className="bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/15 p-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-[15px] font-bold text-ink-900 font-headline">
                Evidence review
              </h2>
            </div>
            <ul className="mt-3 divide-y divide-slate-100">
              {evidence.map((f) => (
                <li key={f.id} className="flex flex-col sm:flex-row sm:items-center gap-3 py-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-md bg-surface-container flex items-center justify-center">
                      <FileText className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-ink-900 truncate flex items-center gap-2">
                        {f.file_name}
                        {f.is_reviewed && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            Reviewed
                          </span>
                        )}
                        {!f.is_visible_to_parties && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {f.file_size_kb} KB · {f.uploaded_by?.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        downloadEvidence(f.id, f.file_name).catch((err) =>
                          alert(err.message)
                        )
                      }
                      className="text-[12px] font-semibold text-primary inline-flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Get
                    </button>
                    {!f.is_reviewed && (
                      <button
                        type="button"
                        disabled={evBusy === f.id}
                        onClick={() => markEvidenceReviewed(f.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] font-semibold border border-emerald-200 bg-emerald-50 text-emerald-800"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {evBusy === f.id ? "…" : "Mark reviewed"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
              {evidence.length === 0 && (
                <li className="text-[12px] text-slate-500 py-6 text-center">No evidence.</li>
              )}
            </ul>
          </section>

          <section className="rounded-xl p-5 bg-amber-50/70 border border-amber-200">
            <h2 className="text-[14px] font-bold text-amber-900 font-headline">
              Arbitration
            </h2>
            <p className="text-[12px] text-slate-600 mt-2">
              When evidence is satisfactory and mediation exhausted, proceed to arbitration.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/admin/queue"
                className="inline-flex items-center px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] font-medium hover:bg-surface-container"
              >
                Back to queue
              </Link>
              <Link
                to={`/admin/disputes/${id}/arbitration`}
                className="inline-flex items-center gap-2 bg-primary text-on-primary text-[13px] font-semibold px-4 py-2.5 rounded-lg hover:opacity-95"
              >
                <Gavel className="w-4 h-4" />
                Arbitration panel
              </Link>
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="bg-surface-container-lowest rounded-xl shadow-card border border-outline-variant/15 p-5">
            <h2 className="text-[15px] font-bold text-ink-900 font-headline">Parties</h2>
            <div className="mt-3 space-y-3">
              <Party party={dispute.parties?.complainant} tag={<IntegrationTag className="ml-2">G01</IntegrationTag>} />
              <Party party={dispute.parties?.respondent} />
            </div>
          </section>

          <div className="bg-primary text-on-primary rounded-xl p-5 shadow-card">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-tertiary-fixed-dim" />
                <span className="text-[13px] font-semibold">Payment context</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-[11px] text-white/60">Escrow</div>
              <div className="text-[26px] font-extrabold text-tertiary-fixed-dim leading-tight">
                ${(dispute.payment?.escrow ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="mt-3">
              <div className="text-[11px] text-white/60">Status</div>
              <div className="text-[13px] font-semibold">{dispute.payment?.status}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Party({ party, tag }) {
  if (!party) return null;
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
        <div className="text-[11px] text-slate-500">{party.role}</div>
      </div>
    </div>
  );
}
