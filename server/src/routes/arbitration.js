// /api/disputes/:id/arbitration — admin issues a final ruling (FR-DR-22..27)
const express = require("express");
const { pool, query } = require("../config/db");
const { httpError } = require("../middleware/error");
const { requireAdmin } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");
const { serializeDecision } = require("../utils/serializers");

const router = express.Router({ mergeParams: true });

const VALID_OUTCOMES = ["favour_client", "favour_freelancer", "split", "dismissed"];

// GET — fetch the (single) decision for a dispute
router.get("/", async (req, res, next) => {
  try {
    const did = parseInt(req.params.id, 10);
    const { rows } = await query(
      `SELECT ad.*, au.display_name AS admin_name
         FROM dispute_arbitration_decisions ad
         JOIN admin_profiles ap ON ap.id = ad.admin_id
         JOIN users          au ON au.id = ap.user_id
        WHERE ad.dispute_id = $1`,
      [did]
    );
    res.json(serializeDecision(rows[0]) || null);
  } catch (err) {
    next(err);
  }
});

// POST — submit a decision (admin)
// Body: { outcome, decision_notes, payment_signal_sent }
router.post("/", requireAdmin, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const did = parseInt(req.params.id, 10);
    const { outcome, decision_notes, payment_signal_sent } = req.body || {};

    if (!VALID_OUTCOMES.includes(outcome)) {
      throw httpError(400, `outcome must be one of: ${VALID_OUTCOMES.join(", ")}`);
    }
    if (!decision_notes || !decision_notes.trim()) {
      throw httpError(400, "decision_notes is required.");
    }

    await client.query("BEGIN");

    const d = await client.query(
      "SELECT status FROM disputes WHERE id = $1 FOR UPDATE",
      [did]
    );
    if (!d.rows[0]) throw httpError(404, "Dispute not found.");
    if (d.rows[0].status === "resolution_completed") {
      throw httpError(400, "Dispute is already resolved.");
    }

    const ins = await client.query(
      `INSERT INTO dispute_arbitration_decisions
         (dispute_id, admin_id, outcome, decision_notes, payment_signal_sent)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [did, req.ctxAdmin.id, outcome, decision_notes.trim(), !!payment_signal_sent]
    );

    // Move dispute to resolution_completed
    const oldStatus = d.rows[0].status;
    await client.query(
      `UPDATE disputes SET status = 'resolution_completed', resolved_at = NOW(), updated_at = NOW()
        WHERE id = $1`,
      [did]
    );
    await client.query(
      `INSERT INTO dispute_status_history (dispute_id, old_status, new_status, changed_by)
       VALUES ($1, $2, 'resolution_completed', $3)`,
      [did, oldStatus, req.ctxUser.id]
    );

    await client.query("COMMIT");

    await logAudit({
      adminId: req.ctxAdmin.id,
      actionType: "dispute_decision",
      targetEntityId: did,
      targetEntityType: "dispute",
      details: `Issued decision: ${outcome}`,
    });

    const enriched = await query(
      `SELECT ad.*, au.display_name AS admin_name
         FROM dispute_arbitration_decisions ad
         JOIN admin_profiles ap ON ap.id = ad.admin_id
         JOIN users          au ON au.id = ap.user_id
        WHERE ad.id = $1`,
      [ins.rows[0].id]
    );
    res.status(201).json(serializeDecision(enriched.rows[0]));
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
