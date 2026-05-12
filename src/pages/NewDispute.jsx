import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FileText, Trash2, UploadCloud } from "lucide-react";
import IntegrationTag from "../components/IntegrationTag";
import { apiFetch } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { DISPUTE_TYPES } from "../constants/dispute";

export default function NewDispute() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const inputRef = useRef(null);

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [disputeType, setDisputeType] = useState("non_payment");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [loadErr, setLoadErr] = useState("");
  const [submitErr, setSubmitErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (user?.is_admin) {
    return <Navigate to="/admin/queue" replace />;
  }

  useEffect(() => {
    if (!user?.id) return;
    const uid = user.id;
    (async () => {
      try {
        const [pc, pf] = await Promise.all([
          apiFetch(`/api/projects?client_id=${uid}`),
          apiFetch(`/api/projects?freelancer_id=${uid}`),
        ]);
        const map = new Map();
        for (const p of [...pc, ...pf]) map.set(p.id, p);
        setProjects([...map.values()].sort((a, b) => a.id - b.id));
      } catch (e) {
        setLoadErr(e.message || "Could not load projects.");
      }
    })();
  }, [user?.id]);

  const selected = projects.find((p) => String(p.id) === String(projectId));
  const otherPartyLabel = selected
    ? user?.id === selected.client_id
      ? selected.freelancer_name
        ? `${selected.freelancer_name} (freelancer)`
        : `User #${selected.freelancer_id}`
      : selected.client_name
        ? `${selected.client_name} (client)`
        : `User #${selected.client_id}`
    : "—";

  function onBrowse(e) {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    const mapped = list.map((f) => ({
      file: f,
      name: f.name,
      size: prettySize(f.size),
      type: f.type.startsWith("image") ? "Image" : (f.name.split(".").pop() || "").toUpperCase(),
      visible: true,
    }));
    setFiles((prev) => [...prev, ...mapped]);
    e.target.value = "";
  }

  async function uploadEvidence(disputeNumericId, fileItem) {
    const fd = new FormData();
    fd.append("file", fileItem.file);
    fd.append("is_visible_to_parties", String(!!fileItem.visible));
    await apiFetch(`/api/disputes/${disputeNumericId}/evidence`, {
      method: "POST",
      body: fd,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitErr("");
    if (!projectId) {
      setSubmitErr("Choose a project.");
      return;
    }
    const desc = description.trim();
    if (!desc) {
      setSubmitErr("Description is required.");
      return;
    }
    setBusy(true);
    try {
      const created = await apiFetch("/api/disputes", {
        method: "POST",
        body: {
          project_id: parseInt(projectId, 10),
          dispute_type: disputeType,
          description: desc,
        },
      });
      const did = created.id;
      for (const f of files) {
        try {
          await uploadEvidence(did, f);
        } catch (err) {
          setSubmitErr(
            `Dispute filed as #${did}, but an upload failed: ${err.message}. You can upload more from the case page later.`
          );
          navigate(`/disputes/${did}`);
          return;
        }
      }
      navigate(`/disputes/${did}`);
    } catch (err) {
      setSubmitErr(err.message || "Could not submit.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-[760px] mx-auto">
      <Link
        to="/disputes"
        className="text-xs font-semibold text-slate-500 hover:text-primary mb-4 inline-block"
      >
        ← Back to disputes
      </Link>
      <h1 className="text-[22px] font-extrabold text-primary font-headline">
        File a new dispute
      </h1>
      <p className="text-[13px] text-slate-500 mt-1 mb-6">
        Select an active project where you are a party, explain the issue, then attach evidence (optional).
      </p>

      {loadErr && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-lg">{loadErr}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardTitle index="1." title="Project" subtitle="Only projects you participate in" />
          <div className="mt-4">
            <label className="text-[12px] font-semibold text-ink-700">Project</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/30 outline-none focus:ring-2 focus:ring-tertiary-fixed-dim text-[13px]"
              required
            >
              <option value="">Choose project…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.id} — {p.project_title} (${Number(p.escrow_amount || 0).toFixed(2)} escrow)
                </option>
              ))}
            </select>
          </div>
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-slate-100">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-ink-500">Other party</div>
              <div className="mt-1 text-[14px] font-semibold text-ink-900">{otherPartyLabel}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-ink-500">
                Escrow status (today)
              </div>
              <div className="mt-1 text-[14px] font-semibold text-ink-900">
                {selected ? selected.payment_status : "—"}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <IntegrationTag>Filing user: {user?.name}</IntegrationTag>
          </div>
        </Card>

        <Card>
          <CardTitle index="2." title="Dispute type" subtitle="Primary reason category" />
          <div className="mt-4 space-y-2">
            {DISPUTE_TYPES.map((r) => (
              <label
                key={r.value}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                  disputeType === r.value
                    ? "border-tertiary-fixed-dim bg-surface-container"
                    : "border-slate-200 hover:bg-surface-container-low"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    disputeType === r.value ? "border-primary" : "border-slate-300"
                  }`}
                >
                  {disputeType === r.value && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </span>
                <input
                  type="radio"
                  className="sr-only"
                  name="dtype"
                  value={r.value}
                  checked={disputeType === r.value}
                  onChange={() => setDisputeType(r.value)}
                />
                <span className="text-[13px] text-ink-900">{r.label}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card>
          <CardTitle index="3." title="Description" subtitle="Facts, dates, attempts to resolve" />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue…"
            rows={6}
            className="mt-4 w-full px-3 py-2.5 rounded-lg bg-surface-container border border-transparent focus:border-tertiary-fixed-dim outline-none text-[13px] resize-y"
            required
          />
        </Card>

        <Card>
          <CardTitle
            index="4."
            title="Evidence (optional)"
            subtitle="Uploaded after filing to the dispute; larger files supported."
          />
          <div className="mt-4 rounded-xl border border-dashed border-outline-variant/50 bg-surface-container-low py-8 px-4 text-center">
            <UploadCloud className="w-8 h-8 mx-auto text-slate-400" />
            <div className="mt-3 text-[14px] font-semibold text-ink-900">Drop files or browse</div>
            <p className="mt-1 text-[11px] text-ink-500">PDF, images, DOCX, ZIP — up to 25MB each</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 px-4 py-2 rounded-lg bg-white border border-outline-variant/40 text-[13px] font-medium hover:bg-surface-container"
            >
              Browse files
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.docx,.zip"
              onChange={onBrowse}
              className="hidden"
            />
          </div>
          {files.length > 0 && (
            <ul className="mt-4 divide-y divide-slate-100 border border-slate-100 rounded-lg">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="w-8 h-8 rounded-md bg-surface-container-low flex items-center justify-center">
                    <FileText className="w-4 h-4 text-ink-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium text-ink-900 truncate">{f.name}</div>
                    <div className="text-[11px] text-ink-500">
                      {f.size} • {f.type}
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-[12px] text-ink-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={f.visible}
                      onChange={() =>
                        setFiles((prev) =>
                          prev.map((x, j) =>
                            j === i ? { ...x, visible: !x.visible } : x
                          )
                        )
                      }
                    />
                    Visible to other party
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, j) => j !== i))
                    }
                    className="text-rose-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {submitErr && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            {submitErr}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <Link
            to="/disputes"
            className="px-5 py-2.5 rounded-lg border border-outline-variant/40 bg-white text-[13px] font-medium hover:bg-surface-container"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={busy}
            className="px-5 py-2.5 rounded-lg bg-primary text-on-primary text-[13px] font-semibold disabled:opacity-50"
          >
            {busy ? "Submitting…" : "Submit dispute"}
          </button>
        </div>
      </form>
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

function CardTitle({ index, title, subtitle }) {
  return (
    <div>
      <h2 className="text-[15px] font-bold text-ink-900 font-headline">
        {index} {title}
      </h2>
      {subtitle && <p className="text-[12px] text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function prettySize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
