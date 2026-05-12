// /api/users — light-weight read endpoints (Module 1 owns the canonical store)
const express = require("express");
const { query } = require("../config/db");
const { httpError } = require("../middleware/error");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// GET /api/users/me — caller from JWT (or dev header); mounted behind requireUser
router.get("/me", async (req, res) => {
  res.json({
    id: req.ctxUser.id,
    name: req.ctxUser.name,
    email: req.ctxUser.email,
    role: req.ctxUser.role,
    account_status: req.ctxUser.account_status,
    is_admin: !!req.ctxAdmin,
    admin_profile: req.ctxAdmin || null,
  });
});

router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const params = [];
    const clauses = ["deleted_at IS NULL"];
    if (req.query.role) {
      params.push(req.query.role);
      clauses.push(`role = $${params.length}`);
    }
    const where = "WHERE " + clauses.join(" AND ");
    const { rows } = await query(
      `SELECT id, display_name AS name, email, role::text AS role, account_status::text AS account_status
         FROM users ${where} ORDER BY id`,
      params
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const privileged = !!(req.ctxAdmin && req.ctxAdmin.is_active);
    if (!privileged && id !== req.ctxUser.id) {
      return res.status(403).json({ error: "You may only view your own profile." });
    }
    const { rows } = await query(
      `SELECT id, display_name AS name, email, role::text AS role, account_status::text AS account_status
         FROM users WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
    if (!rows[0]) throw httpError(404, "User not found.");
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
