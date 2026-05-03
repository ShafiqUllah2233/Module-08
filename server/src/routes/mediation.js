// /api/disputes/:id/mediation — chat statements between parties (FR-DR-17..21)
const express = require("express");
const { query } = require("../config/db");
const { httpError } = require("../middleware/error");
const { serializeMediation } = require("../utils/serializers");

const router = express.Router({ mergeParams: true });

// GET — list statements
router.get("/", async (req, res, next) => {
  try {
    const did = parseInt(req.params.id, 10);
    const { rows } = await query(
      `SELECT m.*, u.name AS author_name
         FROM mediation_records m
         JOIN users u ON u.id = m.author_id
        WHERE m.dispute_id = $1
        ORDER BY m.submitted_at`,
      [did]
    );
    res.json(rows.map(serializeMediation));
  } catch (err) {
    next(err);
  }
});

// POST — append a statement
router.post("/", async (req, res, next) => {
  try {
    const did = parseInt(req.params.id, 10);
    const text = (req.body && req.body.statement || "").trim();
    if (!text) throw httpError(400, "Field 'statement' is required.");

    // Mediation can only happen while the dispute is in mediation
    const d = await query("SELECT status FROM disputes WHERE id = $1", [did]);
    if (!d.rows[0]) throw httpError(404, "Dispute not found.");
    if (!["mediation", "under_review"].includes(d.rows[0].status)) {
      throw httpError(400, "Mediation is only allowed while dispute is in mediation.");
    }

    const ins = await query(
      `INSERT INTO mediation_records (dispute_id, author_id, statement)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [did, req.ctxUser.id, text]
    );

    // Bump dispute to mediation if it was still in under_review
    if (d.rows[0].status === "under_review") {
      await query(
        `UPDATE disputes SET status = 'mediation', updated_at = NOW() WHERE id = $1`,
        [did]
      );
      await query(
        `INSERT INTO dispute_status_history (dispute_id, old_status, new_status, changed_by)
         VALUES ($1, 'under_review', 'mediation', $2)`,
        [did, req.ctxUser.id]
      );
    }

    const enriched = await query(
      `SELECT m.*, u.name AS author_name
         FROM mediation_records m
         JOIN users u ON u.id = m.author_id
        WHERE m.id = $1`,
      [ins.rows[0].id]
    );
    res.status(201).json(serializeMediation(enriched.rows[0]));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
