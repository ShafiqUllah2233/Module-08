/**
 * JWT authentication + authorization for Module 8.
 * Prefer Authorization: Bearer <token> from POST /api/auth/login.
 *
 * Legacy dev-only: ALLOW_HEADER_AUTH=true enables x-user-id (no JWT) — insecure.
 */
const jwt = require("jsonwebtoken");
const { query } = require("../config/db");
const { httpError } = require("./error");

async function attachUserContext(req, userId) {
  const u = await query(
    `SELECT id,
            display_name AS name,
            email,
            role::text AS role,
            account_status::text AS account_status
       FROM users
      WHERE id = $1 AND deleted_at IS NULL`,
    [userId]
  );
  req.ctxUser = u.rows[0] || null;
  req.ctxAdmin = null;
  if (!req.ctxUser) return;
  const a = await query(
    "SELECT id, user_id, role, is_active FROM admin_profiles WHERE user_id = $1",
    [userId]
  );
  req.ctxAdmin = a.rows[0] || null;
}

/**
 * Parses JWT or (optionally) x-user-id, populates req.ctxUser / req.ctxAdmin.
 */
async function authenticate(req, res, next) {
  req.ctxUser = null;
  req.ctxAdmin = null;

  const secret = process.env.JWT_SECRET;
  const authz = req.headers.authorization || "";

  if (authz.startsWith("Bearer ")) {
    const token = authz.slice(7).trim();
    if (!token) {
      return res.status(401).json({ error: "Missing bearer token." });
    }
    if (!secret || secret.length < 16) {
      return res.status(500).json({ error: "Server authentication is misconfigured (JWT_SECRET)." });
    }
    try {
      const payload = jwt.verify(token, secret);
      const raw = payload.sub ?? payload.userId ?? payload.user_id;
      const userId = typeof raw === "number" ? raw : parseInt(raw, 10);
      if (!Number.isFinite(userId)) {
        return res.status(401).json({ error: "Invalid token subject." });
      }
      await attachUserContext(req, userId);
      if (!req.ctxUser) {
        return res.status(401).json({ error: "User no longer exists." });
      }
      return next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired. Sign in again." });
      }
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Invalid token." });
      }
      return next(err);
    }
  }

  if (process.env.ALLOW_HEADER_AUTH === "true") {
    const uid = parseInt(req.headers["x-user-id"], 10);
    if (Number.isFinite(uid)) {
      await attachUserContext(req, uid);
    }
    return next();
  }

  return next();
}

function requireUser(req, res, next) {
  if (!req.ctxUser) {
    return res.status(401).json({
      error: "Authentication required.",
      hint: "POST /api/auth/login, then Authorization: Bearer <token>.",
    });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.ctxAdmin || !req.ctxAdmin.is_active) {
    return res.status(403).json({ error: "Admin privileges required." });
  }
  next();
}

module.exports = {
  authenticate,
  attachUserContext,
  requireUser,
  requireAdmin,
};
