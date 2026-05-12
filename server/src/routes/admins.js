// /api/admins — manage admin staff (FR-DR-32..35)
const crypto = require("crypto");
const express = require("express");
const bcrypt = require("bcrypt");
const { pool, query } = require("../config/db");
const { httpError } = require("../middleware/error");
const { requireAdmin } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");
const { serializeAdmin } = require("../utils/serializers");
const { normalizeEmail, isValidEmail } = require("../utils/validators");

const router = express.Router();

const ADMIN_SELECT = `
  SELECT ap.id, ap.user_id, ap.role, ap.is_active, ap.created_at, ap.updated_at,
         u.display_name AS name, u.email
    FROM admin_profiles ap
    JOIN users u ON u.id = ap.user_id
`;

function generateInitialPassword(length = 16) {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(length);
  let s = "";
  for (let i = 0; i < length; i += 1) {
    s += chars[bytes[i] % chars.length];
  }
  return s;
}

router.get("/", requireAdmin, async (_req, res, next) => {
  try {
    const { rows } = await query(ADMIN_SELECT + " ORDER BY ap.created_at");
    res.json(rows.map(serializeAdmin));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows } = await query(ADMIN_SELECT + " WHERE ap.id = $1", [id]);
    if (!rows[0]) throw httpError(404, "Admin not found.");
    res.json(serializeAdmin(rows[0]));
  } catch (err) {
    next(err);
  }
});

// POST — create a new admin (super admin only for super_admin role)
// Body: { name, email, role?, password? } — if password omitted, a one-time password is returned once.
router.post("/", requireAdmin, async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { name, email, role, password } = req.body || {};
    if (!name || email == null || String(email).trim() === "") {
      throw httpError(400, "name and email are required.");
    }
    const normalized = normalizeEmail(email);
    if (!isValidEmail(normalized)) {
      throw httpError(400, "A valid email address is required.");
    }
    const adminRole = role || "dispute_moderator";
    if (!["dispute_moderator", "super_admin"].includes(adminRole)) {
      throw httpError(400, "role must be dispute_moderator or super_admin.");
    }
    if (adminRole === "super_admin" && req.ctxAdmin.role !== "super_admin") {
      throw httpError(403, "Only super admins may create super admin profiles.");
    }

    let plainPassword =
      typeof password === "string" && password.length > 0 ? password : null;
    let returnedOnce = false;
    if (!plainPassword) {
      plainPassword = generateInitialPassword();
      returnedOnce = true;
    } else if (plainPassword.length < 8) {
      throw httpError(400, "password must be at least 8 characters when provided.");
    }

    const rounds = Math.min(14, Math.max(4, parseInt(process.env.BCRYPT_ROUNDS || "10", 10)));
    const passwordHash = await bcrypt.hash(plainPassword, rounds);

    const parts = String(name).trim().split(/\s+/);
    const first_name = parts[0] || "Admin";
    const last_name = parts.slice(1).join(" ") || "User";

    await client.query("BEGIN");

    const u = await client.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role, account_status)
       VALUES ($1, $2, $3, $4, 'admin', 'active') RETURNING id`,
      [first_name, last_name, normalized, passwordHash]
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
    const body = serializeAdmin(rows[0]);
    if (returnedOnce) {
      body.initial_password = plainPassword;
      body.initial_password_notice =
        "This password is shown once. Store it securely; it cannot be retrieved later.";
    }
    res.status(201).json(body);
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    if (err && err.code === "23505") {
      return next(httpError(409, "That email is already registered."));
    }
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
    if (newRole === "super_admin" && req.ctxAdmin.role !== "super_admin") {
      throw httpError(403, "Only super admins may assign the super_admin role.");
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
