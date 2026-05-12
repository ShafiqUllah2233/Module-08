export const DISPUTE_STATUSES = [
  "submitted",
  "evidence_uploaded",
  "under_review",
  "mediation",
  "admin_arbitration",
  "resolution_completed",
];

export const STATUS_LABELS = {
  submitted: "Open",
  evidence_uploaded: "Awaiting Review",
  under_review: "Awaiting Review",
  mediation: "In Mediation",
  admin_arbitration: "In Arbitration",
  resolution_completed: "Resolved",
};

export const USER_STATUS_FILTERS = [
  { label: "All Statuses", match: () => true },
  { label: "Open", match: (s) => s === "submitted" },
  {
    label: "Awaiting Review",
    match: (s) => s === "evidence_uploaded" || s === "under_review",
  },
  { label: "In Mediation", match: (s) => s === "mediation" },
  { label: "In Arbitration", match: (s) => s === "admin_arbitration" },
  { label: "Resolved", match: (s) => s === "resolution_completed" },
];

export const DISPUTE_TYPES = [
  { value: "non_payment", label: "Non Payment" },
  { value: "poor_quality", label: "Poor Quality" },
  { value: "scope_violation", label: "Scope Violation" },
  { value: "misconduct", label: "Misconduct" },
  { value: "other", label: "Other" },
];

export const ARBITRATION_OUTCOMES = [
  { id: "favour_client", label: "Favour client (full refund)" },
  { id: "favour_freelancer", label: "Favour freelancer (full release)" },
  { id: "split", label: "Split decision" },
  { id: "dismissed", label: "Case dismissed" },
];

export const ADMIN_STATUS_OPTIONS = DISPUTE_STATUSES.map((value) => ({
  value,
  label: STATUS_LABELS[value] || value,
}));
