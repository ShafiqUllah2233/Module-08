// /api/admin/audit-log — immutable record (FR-DR-36..38)
const express = require("express");
const { query } = require("../config/db");
const { requireAdmin } = require("../middleware/auth");
const { serializeAudit } = require("../utils/serializers");

const router = express.Router();

router.use(requireAdmin);

router.get("/", async (req, res, next) => {
  try {
    const where = [];
    const params = [];

    if (req.query.admin_id) {
      params.push(req.query.admin_id);
      where.push(`l.admin_id = $${params.length}`);
    }
    if (req.query.action_type) {
      params.push(req.query.action_type);
      where.push(`l.action_type = $${params.length}`);
    }
    if (req.query.entity_type) {
      params.push(req.query.entity_type);
      where.push(`l.target_entity_type = $${params.length}`);
    }
    if (req.query.target_id) {
      params.push(req.query.target_id);
      where.push(`l.target_entity_id = $${params.length}`);
    }
    if (req.query.from) {
      params.push(req.query.from);
      where.push(`l.performed_at >= $${params.length}`);
    }
    if (req.query.to) {
      params.push(req.query.to);
      where.push(`l.performed_at <= $${params.length}`);
    }
    if (req.query.q) {
      params.push(`%${req.query.q}%`);
      where.push(
        `(l.details ILIKE $${params.length} OR CAST(l.target_entity_id AS TEXT) ILIKE $${params.length})`
      );
    }

    const sql = `
      SELECT l.*, u.display_name AS admin_name
        FROM dispute_admin_audit_log l
        LEFT JOIN admin_profiles ap ON ap.id = l.admin_id
        LEFT JOIN users u           ON u.id  = ap.user_id
       ${where.length ? "WHERE " + where.join(" AND ") : ""}
       ORDER BY l.performed_at DESC
    `;
    const { rows } = await query(sql, params);
    res.json(rows.map(serializeAudit));
  } catch (err) {
    next(err);
  }
});

// CSV export
router.get("/export", async (req, res, next) => {
  try {
    const { rows } = await query(
      `SELECT l.*, u.display_name AS admin_name
         FROM dispute_admin_audit_log l
         LEFT JOIN admin_profiles ap ON ap.id = l.admin_id
         LEFT JOIN users u           ON u.id  = ap.user_id
        ORDER BY l.performed_at DESC`
    );
    const header = ["Timestamp", "Admin", "Action Type", "Entity Type", "Target ID", "Details"];
    const escape = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = [header.map(escape).join(",")];
    for (const r of rows) {
      lines.push([
        new Date(r.performed_at).toISOString(),
        r.admin_name || "",
        r.action_type,
        r.target_entity_type,
        r.target_entity_id,
        r.details || "",
      ].map(escape).join(","));
    }
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="audit-log.csv"`);
    res.send(lines.join("\n"));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
