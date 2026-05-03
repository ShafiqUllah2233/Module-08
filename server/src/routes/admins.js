// /api/admins — manage admin staff (FR-DR-32..35)
const express = require("express");
const { pool, query } = require("../config/db");
const { httpError } = require("../middleware/error");
const { requireAdmin } = require("../middleware/ctxUser");
const { logAudit } = require("../utils/audit");
const { serializeAdmin } = require("../utils/serializers");

const router = express.Router();

const ADMIN_SELECT = `
  SELECT ap.id, ap.user_id, ap.role, ap.is_active, ap.created_at, ap.updated_at,
         u.name, u.email
    FROM admin_profiles ap
    JOIN users u ON u.id = ap.user_id
`;

router.get("/", async (_req, res, next) => {
  try {
    const { rows } = await query(ADMIN_SELECT + " ORDER BY ap.created_at");
    res.json(rows.map(serializeAdmin));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows } = await query(ADMIN_SELECT + " WHERE ap.id = $1", [id]);
    if (!rows[0]) throw httpError(404, "Admin not found.");
    res.json(serializeAdmin(rows[0]));
  } catch (err) {
    next(err);
  }
});

// POST — create a new admin (super admin only in production; relaxed here)
// Body: { name, email, role }   -- creates a user + admin_profile in one tx
router.post("/", requireAdmin, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { name, email, role } = req.body || {};
    if (!name || !email) throw httpError(400, "name and email are required.");
    const adminRole = role || "dispute_moderator";
    if (!["dispute_moderator", "super_admin"].includes(adminRole)) {
      throw httpError(400, "role must be dispute_moderator or super_admin.");
    }

    await client.query("BEGIN");

    const u = await client.query(
      `INSERT INTO users (name, email, role) VALUES ($1, $2, 'admin') RETURNING id`,
      [name, email]
    );
    const ap = await client.query(
      `INSERT INTO admin_profiles (user_id, role, is_active)
       VALUES ($1, $2, TRUE) RETURNING id`,
      [u.rows[0].id, adminRole]
    );

    await client.query("COMMIT");

    await logAudit({
      adminId: req.ctxAdmin.id,
      actionType: "account_created",
      targetEntityId: ap.rows[0].id,
      targetEntityType: "admin_account",
      details: `Created ${adminRole} ${name}`,
    });

    const { rows } = await query(ADMIN_SELECT + " WHERE ap.id = $1", [ap.rows[0].id]);
    res.status(201).json(serializeAdmin(rows[0]));
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
});

// PATCH — update role and/or active flag
router.patch("/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const cur = await query("SELECT role, is_active FROM admin_profiles WHERE id = $1", [id]);
    if (!cur.rows[0]) throw httpError(404, "Admin not found.");

    const newRole =
      req.body.role !== undefined ? req.body.role : cur.rows[0].role;
    const newActive =
      req.body.is_active !== undefined ? !!req.body.is_active : cur.rows[0].is_active;

    if (!["dispute_moderator", "super_admin"].includes(newRole)) {
      throw httpError(400, "role must be dispute_moderator or super_admin.");
    }

    await query(
      `UPDATE admin_profiles
          SET role = $1, is_active = $2, updated_at = NOW()
        WHERE id = $3`,
      [newRole, newActive, id]
    );

    if (newRole !== cur.rows[0].role) {
      await logAudit({
        adminId: req.ctxAdmin.id,
        actionType: "role_changed",
        targetEntityId: id,
        targetEntityType: "admin_account",
        details: `Role: ${cur.rows[0].role} → ${newRole}`,
      });
    }
    if (newActive !== cur.rows[0].is_active && newActive === false) {
      await logAudit({
        adminId: req.ctxAdmin.id,
        actionType: "account_deactivated",
        targetEntityId: id,
        targetEntityType: "admin_account",
        details: "Deactivated admin account",
      });
    }

    const { rows } = await query(ADMIN_SELECT + " WHERE ap.id = $1", [id]);
    res.json(serializeAdmin(rows[0]));
  } catch (err) {
    next(err);
  }
});

// Convenience deactivate route (matches the "Deactivate" button in the UI)
router.post("/:id/deactivate", requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const upd = await query(
      `UPDATE admin_profiles SET is_active = FALSE, updated_at = NOW()
        WHERE id = $1 RETURNING id`,
      [id]
    );
    if (!upd.rows[0]) throw httpError(404, "Admin not found.");

    await logAudit({
      adminId: req.ctxAdmin.id,
      actionType: "account_deactivated",
      targetEntityId: id,
      targetEntityType: "admin_account",
      details: "Deactivated admin account",
    });

    res.json({ id, is_active: false });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
