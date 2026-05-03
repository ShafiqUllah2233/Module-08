// Lightweight "who is calling" middleware for the dev environment.
// Real auth (JWT, sessions, etc.) belongs in Module 1; until that's wired
// the client tells us who it is via headers:
//   x-user-id   numeric users.id
//   x-admin-id  numeric admin_profiles.id (optional, only for admin routes)
//
// If x-user-id is missing we fall back to user 2 (Alice Smith) so the
// API stays usable from a fresh browser without auth plumbing.
const { query } = require("../config/db");

async function ctxUser(req, _res, next) {
  try {
    const uid = parseInt(req.header("x-user-id"), 10) || 2;
    const aid = parseInt(req.header("x-admin-id"), 10) || null;

    const u = await query(
      "SELECT id, name, email, role, account_status FROM users WHERE id = $1",
      [uid]
    );
    req.ctxUser = u.rows[0] || null;

    if (aid) {
      const a = await query(
        "SELECT id, user_id, role, is_active FROM admin_profiles WHERE id = $1",
        [aid]
      );
      req.ctxAdmin = a.rows[0] || null;
    } else {
      // If the calling user has an admin profile, attach it transparently
      const a = await query(
        "SELECT id, user_id, role, is_active FROM admin_profiles WHERE user_id = $1",
        [uid]
      );
      req.ctxAdmin = a.rows[0] || null;
    }
    next();
  } catch (err) {
    next(err);
  }
}

function requireAdmin(req, res, next) {
  if (!req.ctxAdmin || !req.ctxAdmin.is_active) {
    return res.status(403).json({ error: "Admin privileges required." });
  }
  next();
}

module.exports = { ctxUser, requireAdmin };
