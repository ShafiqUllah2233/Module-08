/**
 * POST /api/auth/login — email + password → JWT access token.
 */
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { query } = require("../config/db");
const { httpError } = require("../middleware/error");
const { normalizeEmail } = require("../utils/validators");

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 16) {
      throw httpError(500, "Server authentication is not configured. Set JWT_SECRET (min 16 characters).");
    }

    const email = normalizeEmail(req.body?.email || "");
    const password = req.body?.password;
    if (!email || password == null || String(password).length === 0) {
      throw httpError(400, "email and password are required.");
    }

    const { rows } = await query(
      `SELECT id,
              password_hash,
              display_name AS name,
              email,
              role::text AS role,
              account_status::text AS account_status
         FROM users
        WHERE email = $1 AND deleted_at IS NULL`,
      [email]
    );
    const user = rows[0];
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (user.account_status !== "active") {
      return res.status(403).json({ error: "This account cannot sign in (not active)." });
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
    const token = jwt.sign(
      { sub: user.id },
      secret,
      { expiresIn }
    );

    const decoded = jwt.decode(token);
    const exp = decoded && decoded.exp ? decoded.exp : undefined;

    res.json({
      token,
      token_type: "Bearer",
      expires_at: exp ? new Date(exp * 1000).toISOString() : null,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        account_status: user.account_status,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
