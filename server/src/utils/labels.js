// Maps DB-canonical enum values <-> human-readable labels used by the UI.
// Centralised so both the API output and any reverse-lookups stay consistent.

const STATUS_LABELS = {
  submitted:             "Open",
  evidence_uploaded:     "Awaiting Review",
  under_review:          "Awaiting Review",
  mediation:             "In Mediation",
  admin_arbitration:     "In Arbitration",
  resolution_completed:  "Resolved",
};

const STATUS_VALUES = Object.keys(STATUS_LABELS);

const TYPE_LABELS = {
  non_payment:      "Non Payment",
  poor_quality:     "Poor Quality",
  scope_violation:  "Scope Violation",
  misconduct:       "Misconduct",
  other:            "Other",
};

const TYPE_VALUES = Object.keys(TYPE_LABELS);

const OUTCOME_LABELS = {
  favour_client:      "FAVOUR CLIENT (Full Refund)",
  favour_freelancer:  "FAVOUR FREELANCER (Full Release)",
  split:              "SPLIT DECISION",
  dismissed:          "CASE DISMISSED",
};

const ADMIN_ROLE_LABELS = {
  super_admin:        "Super Admin",
  dispute_moderator:  "Moderator",
};

// Reverse helper: turn a UI label back into the canonical enum value
function labelToStatus(label) {
  const found = Object.entries(STATUS_LABELS).find(([, l]) => l === label);
  return found ? found[0] : null;
}

// Builds a friendly display id like "DSP-2023-001" from the numeric primary key
function dispDisputeId(numericId, createdAt) {
  const year =
    createdAt instanceof Date
      ? createdAt.getFullYear()
      : new Date(createdAt || Date.now()).getFullYear();
  return `DSP-${year}-${String(numericId).padStart(3, "0")}`;
}

module.exports = {
  STATUS_LABELS,
  STATUS_VALUES,
  TYPE_LABELS,
  TYPE_VALUES,
  OUTCOME_LABELS,
  ADMIN_ROLE_LABELS,
  labelToStatus,
  dispDisputeId,
};
