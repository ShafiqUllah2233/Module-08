// /api/users — light-weight read endpoints (Module 1 owns the canonical store)
const express = require("express");
const { query } = require("../config/db");
const { httpError } = require("../middleware/error");

const router = express.Router();

// GET /api/users/me — derived from x-user-id (set by ctxUser middleware)
router.get("/me", async (req, res) => {
  if (!req.ctxUser) return res.status(401).json({ error: "Unknown caller." });
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

router.get("/", async (req, res, next) => {
  try {
    const params = [];
    let where = "";
    if (req.query.role) {
      params.push(req.query.role);
      where = "WHERE role = $1";
    }
    const { rows } = await query(
      `SELECT id, name, email, role, account_status FROM users ${where} ORDER BY id`,
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
    const { rows } = await query(
      "SELECT id, name, email, role, account_status FROM users WHERE id = $1",
      [id]
    );
    if (!rows[0]) throw httpError(404, "User not found.");
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
