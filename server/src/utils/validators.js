/** Basic input validation helpers (centralized DB is the ultimate authority). */

// RFC-inspired practical pattern; rejects obvious garbage without being overly strict.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  if (typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

function isValidEmail(email) {
  const s = normalizeEmail(email);
  if (!s || s.length > 150) return false;
  return EMAIL_REGEX.test(s);
}

module.exports = { normalizeEmail, isValidEmail };
