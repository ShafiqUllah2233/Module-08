// Resolution reports — generated after an arbitration decision (FR-DR-28..31)
// Routes:
//   GET   /api/disputes/:id/report
//   POST  /api/disputes/:id/report          generate (or regenerate)
//   PATCH /api/reports/:id/deliver          { delivered_to_parties }
const express = require("express");
const { query } = require("../config/db");
const { httpError } = require("../middleware/error");
const { requireAdmin } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");
const { OUTCOME_LABELS } = require("../utils/labels");
const { serializeReport } = require("../utils/serializers");

const disputeReportRouter = express.Router({ mergeParams: true });
const reportRouter = express.Router();

disputeReportRouter.get("/", async (req, res, next) => {
  try {
    const did = parseInt(req.params.id, 10);
    const { rows } = await query("SELECT * FROM dispute_resolution_reports WHERE dispute_id = $1", [did]);
    res.json(serializeReport(rows[0]) || null);
  } catch (err) {
    next(err);
  }
});

disputeReportRouter.post("/", requireAdmin, async (req, res, next) => {
  try {
    const did = parseInt(req.params.id, 10);

    const dec = await query(
      `SELECT * FROM dispute_arbitration_decisions WHERE dispute_id = $1`,
      [did]
    );
    if (!dec.rows[0]) {
      throw httpError(400, "Cannot generate a report before a decision is recorded.");
    }
    const decision = dec.rows[0];

    const evCount = await query(
      "SELECT COUNT(*)::int AS n FROM dispute_evidence WHERE dispute_id = $1",
      [did]
    );
    const medCount = await query(
      "SELECT COUNT(*)::int AS n FROM dispute_mediation_records WHERE dispute_id = $1",
      [did]
    );

    const body = req.body || {};
    const fields = {
      dispute_summary:
        body.dispute_summary ||
        `Case D-${String(did).padStart(4, "0")} reviewed by the arbitration panel.`,
      evidence_summary:
        body.evidence_summary ||
        `${evCount.rows[0].n} evidence file(s) reviewed.`,
      mediation_summary:
        body.mediation_summary ||
        `${medCount.rows[0].n} mediation statement(s) recorded.`,
      admin_decision:
        body.admin_decision || OUTCOME_LABELS[decision.outcome] || decision.outcome,
      decision_notes: body.decision_notes || decision.decision_notes,
    };

    const upsert = await query(
      `INSERT INTO dispute_resolution_reports
         (dispute_id, decision_id, dispute_summary, evidence_summary,
          mediation_summary, admin_decision, decision_notes, delivered_to_parties)
       VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
       ON CONFLICT (dispute_id) DO UPDATE
         SET decision_id        = EXCLUDED.decision_id,
             dispute_summary    = EXCLUDED.dispute_summary,
             evidence_summary   = EXCLUDED.evidence_summary,
             mediation_summary  = EXCLUDED.mediation_summary,
             admin_decision     = EXCLUDED.admin_decision,
             decision_notes     = EXCLUDED.decision_notes,
             generated_at       = NOW()
       RETURNING *`,
      [
        did,
        decision.id,
        fields.dispute_summary,
        fields.evidence_summary,
        fields.mediation_summary,
        fields.admin_decision,
        fields.decision_notes,
      ]
    );

    await logAudit({
      adminId: req.ctxAdmin.id,
      actionType: "dispute_decision",
      targetEntityId: upsert.rows[0].id,
      targetEntityType: "resolution_report",
      details: `Generated report for dispute #${did}`,
    });

    res.status(201).json(serializeReport(upsert.rows[0]));
  } catch (err) {
    next(err);
  }
});

reportRouter.patch("/:id/deliver", requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const delivered = !!req.body.delivered_to_parties;
    const upd = await query(
      `UPDATE dispute_resolution_reports SET delivered_to_parties = $1
        WHERE id = $2 RETURNING *`,
      [delivered, id]
    );
    if (!upd.rows[0]) throw httpError(404, "Report not found.");

    await logAudit({
      adminId: req.ctxAdmin.id,
      actionType: "dispute_decision",
      targetEntityId: id,
      targetEntityType: "resolution_report",
      details: delivered ? "Delivered to parties" : "Hidden from parties",
    });

    res.json(serializeReport(upd.rows[0]));
  } catch (err) {
    next(err);
  }
});

module.exports = { disputeReportRouter, reportRouter };
