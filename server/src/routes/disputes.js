// /api/disputes — the central resource of Module 8
const express = require("express");
const { pool, query } = require("../config/db");
const { httpError } = require("../middleware/error");
const { requireAdmin } = require("../middleware/ctxUser");
const { logAudit } = require("../utils/audit");
const { STATUS_VALUES, TYPE_VALUES } = require("../utils/labels");
const {
  serializeDispute,
  serializeEvidence,
  serializeMediation,
  serializeHistory,
  serializeDecision,
  serializeReport,
} = require("../utils/serializers");

const router = express.Router();

// Master select used everywhere a dispute is read.
// Joins parties, project, and the assigned admin in one round-trip.
const DISPUTE_SELECT = `
  SELECT d.*,
         p.project_title, p.contract_status, p.escrow_amount, p.payment_status,
         c.name AS complainant_name, c.role AS complainant_role,
         r.name AS respondent_name,  r.role AS respondent_role,
         au.name AS assigned_admin_name, ap.role AS assigned_admin_role
    FROM disputes d
    JOIN projects p          ON p.id  = d.project_id
    JOIN users    c          ON c.id  = d.complainant_id
    JOIN users    r          ON r.id  = d.respondent_id
    LEFT JOIN admin_profiles ap ON ap.id = d.assigned_admin_id
    LEFT JOIN users          au ON au.id = ap.user_id
`;

// --------------------------------------------------------------------------
// GET /api/disputes/summary  — KPI counts for the dashboard
// --------------------------------------------------------------------------
router.get("/summary", async (_req, res, next) => {
  try {
    const { rows } = await query(`
      SELECT status, COUNT(*)::int AS n
        FROM disputes
       GROUP BY status
    `);
    const by = Object.fromEntries(rows.map((r) => [r.status, r.n]));
    res.json({
      by_status: by,
      total_open: (by.submitted || 0) + (by.evidence_uploaded || 0) + (by.under_review || 0),
      awaiting_review: by.under_review || 0,
      in_mediation: by.mediation || 0,
      in_arbitration: by.admin_arbitration || 0,
      pending_arbitration: by.admin_arbitration || 0,
      resolved: by.resolution_completed || 0,
    });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------------------
// GET /api/disputes  — list with filters
//   ?q=&status=&type=&assigned_admin_id=&complainant_id=&respondent_id=
// --------------------------------------------------------------------------
router.get("/", async (req, res, next) => {
  try {
    const where = [];
    const params = [];

    if (req.query.status) {
      params.push(req.query.status);
      where.push(`d.status = $${params.length}`);
    }
    if (req.query.type) {
      params.push(req.query.type);
      where.push(`d.dispute_type = $${params.length}`);
    }
    if (req.query.assigned_admin_id === "null") {
      where.push("d.assigned_admin_id IS NULL");
    } else if (req.query.assigned_admin_id) {
      params.push(req.query.assigned_admin_id);
      where.push(`d.assigned_admin_id = $${params.length}`);
    }
    if (req.query.complainant_id) {
      params.push(req.query.complainant_id);
      where.push(`d.complainant_id = $${params.length}`);
    }
    if (req.query.respondent_id) {
      params.push(req.query.respondent_id);
      where.push(`d.respondent_id = $${params.length}`);
    }
    if (req.query.q) {
      params.push(`%${req.query.q}%`);
      where.push(
        `(p.project_title ILIKE $${params.length}
          OR c.name ILIKE $${params.length}
          OR r.name ILIKE $${params.length}
          OR CAST(d.id AS TEXT) ILIKE $${params.length})`
      );
    }

    const sql =
      DISPUTE_SELECT +
      (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
      " ORDER BY d.created_at DESC";

    const { rows } = await query(sql, params);
    res.json(rows.map((r) => serializeDispute(r)));
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------------------
// GET /api/disputes/:id  — full detail (dispute + evidence + history + ...)
// --------------------------------------------------------------------------
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows } = await query(DISPUTE_SELECT + " WHERE d.id = $1", [id]);
    const dispute = rows[0];
    if (!dispute) throw httpError(404, "Dispute not found.");

    const [ev, med, hist, dec, rep] = await Promise.all([
      query(
        `SELECT e.*, u.name AS uploaded_by_name
           FROM evidence e
           JOIN users u ON u.id = e.uploaded_by
          WHERE e.dispute_id = $1
          ORDER BY e.uploaded_at`,
        [id]
      ),
      query(
        `SELECT m.*, u.name AS author_name
           FROM mediation_records m
           JOIN users u ON u.id = m.author_id
          WHERE m.dispute_id = $1
          ORDER BY m.submitted_at`,
        [id]
      ),
      query(
        `SELECT h.*, u.name AS changed_by_name
           FROM dispute_status_history h
           JOIN users u ON u.id = h.changed_by
          WHERE h.dispute_id = $1
          ORDER BY h.changed_at`,
        [id]
      ),
      query(
        `SELECT ad.*, au.name AS admin_name
           FROM arbitration_decisions ad
           JOIN admin_profiles ap ON ap.id = ad.admin_id
           JOIN users          au ON au.id = ap.user_id
          WHERE ad.dispute_id = $1`,
        [id]
      ),
      query(`SELECT * FROM resolution_reports WHERE dispute_id = $1`, [id]),
    ]);

    res.json(
      serializeDispute(dispute, {
        evidence: ev.rows,
        mediation: med.rows,
        history: hist.rows,
        decision: dec.rows[0],
        report: rep.rows[0],
      })
    );
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------------------
// POST /api/disputes  — file a new dispute (FR-DR-01..07)
// Body: { project_id, dispute_type, description, complainant_id?, respondent_id? }
// --------------------------------------------------------------------------
router.post("/", async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { project_id, dispute_type, description } = req.body || {};
    if (!project_id || !dispute_type || !description) {
      throw httpError(400, "project_id, dispute_type, and description are required.");
    }
    if (!TYPE_VALUES.includes(dispute_type)) {
      throw httpError(400, `dispute_type must be one of: ${TYPE_VALUES.join(", ")}`);
    }

    await client.query("BEGIN");

    // Resolve parties from the project unless explicitly overridden
    const proj = await client.query(
      "SELECT id, client_id, freelancer_id FROM projects WHERE id = $1",
      [project_id]
    );
    if (!proj.rows[0]) throw httpError(400, "Project not found.");

    const complainantId =
      req.body.complainant_id || req.ctxUser?.id || proj.rows[0].client_id;
    const respondentId =
      req.body.respondent_id ||
      (complainantId === proj.rows[0].client_id
        ? proj.rows[0].freelancer_id
        : proj.rows[0].client_id);

    // Suspended/banned users can't file (per Module 1 contract)
    const cu = await client.query(
      "SELECT account_status FROM users WHERE id = $1",
      [complainantId]
    );
    if (!cu.rows[0]) throw httpError(400, "Complainant not found.");
    if (cu.rows[0].account_status !== "active") {
      throw httpError(403, "Suspended or banned users cannot file disputes.");
    }

    const ins = await client.query(
      `INSERT INTO disputes (project_id, complainant_id, respondent_id, dispute_type, description, status)
       VALUES ($1, $2, $3, $4, $5, 'submitted')
       RETURNING id`,
      [project_id, complainantId, respondentId, dispute_type, description]
    );
    const newId = ins.rows[0].id;

    await client.query(
      `INSERT INTO dispute_status_history (dispute_id, old_status, new_status, changed_by)
       VALUES ($1, 'submitted', 'submitted', $2)`,
      [newId, complainantId]
    );

    await client.query("COMMIT");

    const { rows } = await query(DISPUTE_SELECT + " WHERE d.id = $1", [newId]);
    res.status(201).json(serializeDispute(rows[0]));
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

// --------------------------------------------------------------------------
// PATCH /api/disputes/:id/status  — admin status change (FR-DR-13..16)
// Body: { status }
// --------------------------------------------------------------------------
router.patch("/:id/status", requireAdmin, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body || {};
    if (!STATUS_VALUES.includes(status)) {
      throw httpError(400, `status must be one of: ${STATUS_VALUES.join(", ")}`);
    }

    await client.query("BEGIN");
    const cur = await client.query(
      "SELECT status FROM disputes WHERE id = $1 FOR UPDATE",
      [id]
    );
    if (!cur.rows[0]) throw httpError(404, "Dispute not found.");
    const oldStatus = cur.rows[0].status;
    if (oldStatus === status) {
      await client.query("ROLLBACK");
      return res.json({ id, status, unchanged: true });
    }

    await client.query(
      "UPDATE disputes SET status = $1, updated_at = NOW() WHERE id = $2",
      [status, id]
    );

    await client.query(
      `INSERT INTO dispute_status_history (dispute_id, old_status, new_status, changed_by)
       VALUES ($1, $2, $3, $4)`,
      [id, oldStatus, status, req.ctxUser.id]
    );

    await client.query("COMMIT");

    await logAudit({
      adminId: req.ctxAdmin.id,
      actionType: "status_updated",
      targetEntityId: id,
      targetEntityType: "dispute",
      details: `Status: ${oldStatus} → ${status}`,
    });

    res.json({ id, status, previous: oldStatus });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

// --------------------------------------------------------------------------
// PATCH /api/disputes/:id/assign  — assign / reassign admin
// Body: { admin_id | null }
// --------------------------------------------------------------------------
router.patch("/:id/assign", requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const adminId =
      req.body.admin_id === null || req.body.admin_id === undefined
        ? null
        : parseInt(req.body.admin_id, 10);

    if (adminId !== null) {
      const exists = await query(
        "SELECT id FROM admin_profiles WHERE id = $1 AND is_active = TRUE",
        [adminId]
      );
      if (!exists.rows[0]) throw httpError(400, "Admin not found or inactive.");
    }

    const upd = await query(
      `UPDATE disputes SET assigned_admin_id = $1, updated_at = NOW()
        WHERE id = $2 RETURNING id`,
      [adminId, id]
    );
    if (!upd.rows[0]) throw httpError(404, "Dispute not found.");

    await logAudit({
      adminId: req.ctxAdmin.id,
      actionType: "status_updated",
      targetEntityId: id,
      targetEntityType: "dispute",
      details: adminId
        ? `Assigned admin profile #${adminId}`
        : "Unassigned",
    });

    res.json({ id, assigned_admin_id: adminId });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------------------
// POST /api/disputes/:id/escalate  — mediation -> admin_arbitration (FR-DR-19)
// --------------------------------------------------------------------------
router.post("/:id/escalate", async (req, res, next) => {
  const client = await pool.connect();
  try {
    const id = parseInt(req.params.id, 10);
    await client.query("BEGIN");

    const cur = await client.query(
      "SELECT status FROM disputes WHERE id = $1 FOR UPDATE",
      [id]
    );
    if (!cur.rows[0]) throw httpError(404, "Dispute not found.");
    if (cur.rows[0].status === "resolution_completed") {
      throw httpError(400, "Dispute is already resolved.");
    }

    await client.query(
      `UPDATE disputes
          SET status = 'admin_arbitration',
              mediation_escalated = TRUE,
              updated_at = NOW()
        WHERE id = $1`,
      [id]
    );
    await client.query(
      `INSERT INTO dispute_status_history (dispute_id, old_status, new_status, changed_by)
       VALUES ($1, $2, 'admin_arbitration', $3)`,
      [id, cur.rows[0].status, req.ctxUser.id]
    );

    await client.query("COMMIT");
    res.json({ id, status: "admin_arbitration" });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

module.exports = router;
// Re-export helpers other route files reuse
module.exports.DISPUTE_SELECT = DISPUTE_SELECT;
