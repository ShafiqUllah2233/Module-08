import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Trash2, UploadCloud } from "lucide-react";
import IntegrationTag from "../components/IntegrationTag";

const REASONS = [
  { id: "non-payment", label: "Non-payment / Escrow release issue" },
  { id: "poor-quality", label: "Poor quality of delivered work" },
  { id: "scope", label: "Scope violation / Requirements not met" },
  { id: "misconduct", label: "Professional misconduct / Unresponsiveness" },
  { id: "other", label: "Other" },
];

const STARTER_FILES = [
  { name: "Original_Project_Brief.pdf", size: "2.1 MB", type: "PDF", visible: true },
  { name: "Email_Thread_Oct12.pdf", size: "812 KB", type: "PDF", visible: true },
  { name: "Last_Delivered_Mockup.png", size: "1.6 MB", type: "Image", visible: false },
];

export default function NewDispute() {
  const navigate = useNavigate();
  const [reason, setReason] = useState("non-payment");
  const [projectId, setProjectId] = useState("");
  const [respondent, setRespondent] = useState({
    name: "Bob Jones (Freelancer)",
    amount: "$2,500.00 (Escrowed)",
  });
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState(STARTER_FILES);
  const inputRef = useRef(null);

  function onBrowse(e) {
    const list = Array.from(e.target.files || []);
    if (!list.length) return;
    const mapped = list.map((f) => ({
      name: f.name,
      size: prettySize(f.size),
      type: f.type.startsWith("image") ? "Image" : f.name.split(".").pop().toUpperCase(),
      visible: true,
    }));
    setFiles((prev) => [...prev, ...mapped]);
    e.target.value = "";
  }

  function toggleVisible(idx) {
    setFiles((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, visible: !f.visible } : f))
    );
  }
  function removeFile(idx) {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // In a real build this would POST to the dispute API per FR-DR-01..07.
    navigate("/disputes/DSP-2023-001");
  }

  return (
    <div className="max-w-[760px] mx-auto">
      <h1 className="text-[22px] font-extrabold text-ink-900">File a New Dispute</h1>
      <p className="text-[13px] text-ink-500 mt-1 mb-6">
        Please provide details and upload supporting evidence to initiate the
        dispute resolution process.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 1. Project Details */}
        <Card>
          <CardTitle index="1." title="Project Details" subtitle="Select the project you are filing a dispute for" />

          <div className="mt-4 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-end">
            <div>
              <label className="text-[12px] font-medium text-ink-700">
                Project ID or Name
              </label>
              <input
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                placeholder="e.g. PRJ-98765"
                className="mt-1 w-full px-3 py-2.5 rounded-lg bg-lavender-50 border border-transparent focus:border-mint-400 focus:bg-white outline-none text-[13px]"
              />
            </div>

            <IntegrationTag>Links to G03/G04 — Job Posting & AI Matching</IntegrationTag>

            <button
              type="button"
              className="px-4 py-2.5 rounded-lg bg-mint-300 hover:bg-mint-400 text-navy-900 font-semibold text-[13px] border border-mint-400/40"
            >
              Find Project
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-slate-100">
            <div>
              <div className="text-[11px] uppercase tracking-wide text-ink-500">
                Respondent
              </div>
              <div className="mt-1 text-[14px] font-semibold text-ink-900">
                {respondent.name}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wide text-ink-500">
                Contract Amount
              </div>
              <div className="mt-1 text-[14px] font-semibold text-ink-900">
                {respondent.amount}
              </div>
            </div>
          </div>
        </Card>

        {/* 2. Dispute Reason */}
        <Card>
          <CardTitle index="2." title="Dispute Reason" subtitle="What is the primary reason for this dispute?" />

          <div className="mt-4 space-y-2">
            {REASONS.map((r) => (
              <label
                key={r.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                  reason === r.id
                    ? "border-mint-400 bg-mint-300/10"
                    : "border-slate-200 hover:bg-lavender-50"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    reason === r.id ? "border-navy-900" : "border-slate-300"
                  }`}
                >
                  {reason === r.id && (
                    <span className="w-2 h-2 rounded-full bg-navy-900" />
                  )}
                </span>
                <input
                  type="radio"
                  className="sr-only"
                  name="reason"
                  value={r.id}
                  checked={reason === r.id}
                  onChange={() => setReason(r.id)}
                />
                <span className="text-[13px] text-ink-900">{r.label}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* 3. Description */}
        <Card>
          <CardTitle index="3." title="Description" subtitle="Provide a detailed explanation of the issue" />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Please describe what happened, when it happened, and what steps you've already taken to resolve it..."
            rows={5}
            className="mt-4 w-full px-3 py-2.5 rounded-lg bg-lavender-50 border border-transparent focus:border-mint-400 focus:bg-white outline-none text-[13px] resize-y"
          />
        </Card>

        {/* 4. Evidence */}
        <Card>
          <CardTitle
            index="4."
            title="Evidence"
            subtitle="Attach supporting files. Once the dispute is filed, evidence is locked and visible to administrators."
          />

          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-lavender-50 py-8 px-4 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-white shadow-sm flex items-center justify-center">
              <UploadCloud className="w-5 h-5 text-ink-500" />
            </div>
            <div className="mt-3 text-[14px] font-semibold text-ink-900">
              Drag &amp; Drop files here
            </div>
            <div className="mt-1 text-[11px] text-ink-500 max-w-md mx-auto">
              Upload PDFs, images, or ZIP archives up to 25MB. All evidence is
              visible to administrators.
            </div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-white border border-slate-200 text-[13px] font-medium text-ink-900 hover:bg-lavender-50"
            >
              Browse Files
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              onChange={onBrowse}
              className="hidden"
            />
          </div>

          {files.length > 0 && (
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[12px] font-semibold text-ink-700">
                  Attached files ({files.length})
                </div>
                <div className="text-[11px] text-ink-500">
                  Toggle “Visible to other party” per file
                </div>
              </div>
              <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <div className="w-7 h-7 rounded-md bg-lavender-50 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-ink-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-ink-900 truncate">
                        {f.name}
                      </div>
                      <div className="text-[11px] text-ink-500">
                        {f.size} • {f.type}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleVisible(i)}
                      className="flex items-center gap-2 text-[12px] text-ink-500"
                    >
                      <span
                        className={`relative inline-block w-9 h-5 rounded-full transition-colors ${
                          f.visible ? "bg-mint-400" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                            f.visible ? "left-[18px]" : "left-0.5"
                          }`}
                        />
                      </span>
                      Visible
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-rose-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => navigate("/disputes")}
            className="px-5 py-2.5 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-ink-900 hover:bg-lavender-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-navy-900 hover:bg-navy-800 text-white text-[13px] font-semibold"
          >
            Submit Dispute
          </button>
        </div>
      </form>
    </div>
  );
}

function Card({ children }) {
  return (
    <section className="bg-white rounded-xl shadow-card p-5">{children}</section>
  );
}

function CardTitle({ index, title, subtitle }) {
  return (
    <div>
      <h2 className="text-[15px] font-bold text-ink-900">
        {index} {title}
      </h2>
      {subtitle && (
        <p className="text-[12px] text-ink-500 mt-0.5">{subtitle}</p>
      )}
    </div>
  );
}

function prettySize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
