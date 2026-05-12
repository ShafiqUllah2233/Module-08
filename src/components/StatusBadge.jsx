const stylesByLabel = {
  Open: "bg-pill-openBg text-pill-openFg",
  "Awaiting Review": "bg-pill-reviewBg text-pill-reviewFg",
  "In Mediation": "bg-pill-mediationBg text-pill-mediationFg",
  "In Arbitration": "bg-pill-arbBg text-pill-arbFg",
  Resolved: "bg-pill-resolvedBg text-pill-resolvedFg",
};

/**
 * Accepts UI label (`status_label` from API) or legacy mock strings.
 */
export default function StatusBadge({ label, status, className = "" }) {
  const text =
    label || status || "";
  const cls =
    stylesByLabel[text] ||
    ({
      Active: "bg-pill-activeBg text-pill-activeFg",
      "On Hold": "bg-pill-onholdBg text-pill-onholdFg",
    }[text] ||
    "bg-slate-100 text-slate-700");

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold leading-none ${cls} ${className}`}
    >
      {text}
    </span>
  );
}
