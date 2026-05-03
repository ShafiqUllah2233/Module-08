import { Pin } from "lucide-react";

// Small red dashed annotation used in the Figma to mark cross-module
// integration points (e.g. "Links to G06 — Messaging").
// Purely a visual hint for reviewers; it does not gate functionality.
export default function IntegrationTag({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-dashed border-red-400 bg-red-50 text-[11px] font-medium text-red-600 ${className}`}
    >
      <Pin className="w-3 h-3" />
      {children}
    </span>
  );
}
