// Tiny helper around the admin_audit_log table.
// Every admin-mutating endpoint should call this so the audit page stays accurate.
const { query } = require("../config/db");

const VALID_ACTIONS = [
  "dispute_decision",
  "account_created",
  "role_changed",
  "account_deactivated",
  "evidence_reviewed",
  "status_updated",
];

const VALID_ENTITIES = [
  "dispute",
  "admin_account",
  "resolution_report",
  "evidence",
];

async function logAudit({ adminId, actionType, targetEntityId, targetEntityType, details }) {
  if (!VALID_ACTIONS.includes(actionType)) {
    throw new Error(`Invalid audit action_type: ${actionType}`);
  }
  if (!VALID_ENTITIES.includes(targetEntityType)) {
    throw new Error(`Invalid audit target_entity_type: ${targetEntityType}`);
  }

  await query(
    `INSERT INTO admin_audit_log (admin_id, action_type, target_entity_id, target_entity_type, details)
     VALUES ($1, $2, $3, $4, $5)`,
    [adminId || null, actionType, targetEntityId, targetEntityType, details || null]
  );
}

module.exports = { logAudit, VALID_ACTIONS, VALID_ENTITIES };
