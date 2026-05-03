// Shape DB rows for the API consumers (the React frontend in particular).
const {
  STATUS_LABELS,
  TYPE_LABELS,
  OUTCOME_LABELS,
  ADMIN_ROLE_LABELS,
  dispDisputeId,
} = require("./labels");

function initials(name = "") {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
}

// Maps a row produced by the master dispute SELECT (see disputes.js)
function serializeDispute(row, opts = {}) {
  const out = {
    id: row.id,
    display_id: dispDisputeId(row.id, row.created_at),
    project_id: row.project_id,
    project_title: row.project_title,
    contract_status: row.contract_status,
    dispute_type: row.dispute_type,
    dispute_type_label: TYPE_LABELS[row.dispute_type] || row.dispute_type,
    description: row.description,
    status: row.status,
    status_label: STATUS_LABELS[row.status] || row.status,
    mediation_deadline: row.mediation_deadline,
    mediation_escalated: row.mediation_escalated,
    created_at: row.created_at,
    updated_at: row.updated_at,
    parties: {
      complainant: {
        id: row.complainant_id,
        name: row.complainant_name,
        initials: initials(row.complainant_name || ""),
        role:
          row.complainant_role === "freelancer"
            ? "Complainant (Freelancer)"
            : "Complainant (Client)",
      },
      respondent: {
        id: row.respondent_id,
        name: row.respondent_name,
        initials: initials(row.respondent_name || ""),
        role:
          row.respondent_role === "freelancer"
            ? "Respondent (Freelancer)"
            : "Respondent (Client)",
      },
    },
    assigned_admin: row.assigned_admin_id
      ? {
          id: row.assigned_admin_id,
          name: row.assigned_admin_name,
          role: row.assigned_admin_role,
        }
      : null,
    payment: {
      escrow: row.escrow_amount != null ? Number(row.escrow_amount) : null,
      status: row.payment_status,
    },
  };

  if (opts.evidence) out.evidence = opts.evidence.map(serializeEvidence);
  if (opts.mediation) out.mediation = opts.mediation.map(serializeMediation);
  if (opts.history) out.history = opts.history.map(serializeHistory);
  if (opts.decision) out.decision = serializeDecision(opts.decision);
  if (opts.report) out.report = serializeReport(opts.report);

  return out;
}

function serializeEvidence(row) {
  return {
    id: row.id,
    dispute_id: row.dispute_id,
    file_name: row.file_name,
    file_type: row.file_type,
    file_size_kb: row.file_size_kb,
    file_path: row.file_path,
    is_visible_to_parties: row.is_visible_to_parties,
    uploaded_at: row.uploaded_at,
    uploaded_by: {
      id: row.uploaded_by,
      name: row.uploaded_by_name || null,
    },
  };
}

function serializeMediation(row) {
  return {
    id: row.id,
    dispute_id: row.dispute_id,
    statement: row.statement,
    submitted_at: row.submitted_at,
    author: {
      id: row.author_id,
      name: row.author_name || null,
    },
  };
}

function serializeHistory(row) {
  return {
    id: row.id,
    dispute_id: row.dispute_id,
    old_status: row.old_status,
    old_status_label: STATUS_LABELS[row.old_status] || row.old_status,
    new_status: row.new_status,
    new_status_label: STATUS_LABELS[row.new_status] || row.new_status,
    changed_at: row.changed_at,
    changed_by: {
      id: row.changed_by,
      name: row.changed_by_name || null,
    },
  };
}

function serializeDecision(row) {
  if (!row) return null;
  return {
    id: row.id,
    dispute_id: row.dispute_id,
    admin_id: row.admin_id,
    admin_name: row.admin_name || null,
    outcome: row.outcome,
    outcome_label: OUTCOME_LABELS[row.outcome] || row.outcome,
    decision_notes: row.decision_notes,
    payment_signal_sent: row.payment_signal_sent,
    decided_at: row.decided_at,
  };
}

function serializeReport(row) {
  if (!row) return null;
  return {
    id: row.id,
    dispute_id: row.dispute_id,
    decision_id: row.decision_id,
    dispute_summary: row.dispute_summary,
    evidence_summary: row.evidence_summary,
    mediation_summary: row.mediation_summary,
    admin_decision: row.admin_decision,
    decision_notes: row.decision_notes,
    delivered_to_parties: row.delivered_to_parties,
    generated_at: row.generated_at,
  };
}

function serializeAdmin(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    email: row.email,
    role: row.role,
    role_label: ADMIN_ROLE_LABELS[row.role] || row.role,
    is_active: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function serializeAudit(row) {
  return {
    id: row.id,
    admin_id: row.admin_id,
    admin_name: row.admin_name || null,
    action_type: row.action_type,
    target_entity_id: row.target_entity_id,
    target_entity_type: row.target_entity_type,
    details: row.details,
    performed_at: row.performed_at,
  };
}

module.exports = {
  serializeDispute,
  serializeEvidence,
  serializeMediation,
  serializeHistory,
  serializeDecision,
  serializeReport,
  serializeAdmin,
  serializeAudit,
};
