// Express error formatter — keeps responses uniform.
// Throw `httpError(status, message)` from a route to short-circuit cleanly.

const multer = require("multer");

class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function httpError(status, message, details) {
  return new HttpError(status, message, details);
}

function notFound(_req, res) {
  res.status(404).json({ error: "Route not found." });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Uploaded file exceeds the size limit." });
    }
    return res.status(400).json({ error: err.message || "Upload rejected." });
  }
  if (typeof err.message === "string" && err.message.startsWith("Unsupported file type")) {
    return res.status(400).json({ error: err.message });
  }
  // Postgres errors carry a `code` like "23505" (unique violation), "23503" (FK), etc.
  if (err && err.code) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "Conflict", details: err.detail });
    }
    if (err.code === "23503") {
      return res.status(400).json({ error: "Foreign key violation", details: err.detail });
    }
    if (err.code === "23514") {
      return res.status(400).json({ error: "Check constraint failed", details: err.detail });
    }
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error." });
}

module.exports = { HttpError, httpError, notFound, errorHandler };
