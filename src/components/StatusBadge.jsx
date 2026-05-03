import { STATUSES } from "../data/mockData";

const styles = {
  [STATUSES.MEDIATION]: "bg-pill-mediationBg text-pill-mediationFg",
  [STATUSES.OPEN]: "bg-pill-openBg text-pill-openFg",
  [STATUSES.ARBITRATION]: "bg-pill-arbBg text-pill-arbFg",
  [STATUSES.RESOLVED]: "bg-pill-resolvedBg text-pill-resolvedFg",
  [STATUSES.AWAITING]: "bg-pill-reviewBg text-pill-reviewFg",
  "On Hold": "bg-pill-onholdBg text-pill-onholdFg",
  Active: "bg-pill-activeBg text-pill-activeFg",
};

export default function StatusBadge({ status, className = "" }) {
  const cls = styles[status] || "bg-slate-100 text-slate-700";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold leading-none ${cls} ${className}`}
    >
      {status}
    </span>
  );
}
