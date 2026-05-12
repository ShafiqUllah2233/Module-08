// Express entry point for the G08 Dispute Resolution API.
require("dotenv").config({ override: true });

const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { authenticate, requireUser } = require("./middleware/auth");
const { notFound, errorHandler } = require("./middleware/error");

const authRouter = require("./routes/auth");
const disputesRouter = require("./routes/disputes");
const {
  disputeRouter: evidenceOnDisputeRouter,
  evidenceRouter,
} = require("./routes/evidence");
const mediationRouter = require("./routes/mediation");
const arbitrationRouter = require("./routes/arbitration");
const { disputeReportRouter, reportRouter } = require("./routes/reports");
const statusHistoryRouter = require("./routes/statusHistory");
const adminsRouter = require("./routes/admins");
const auditLogRouter = require("./routes/auditLog");
const usersRouter = require("./routes/users");
const projectsRouter = require("./routes/projects");

const app = express();

// --- Core middleware ---------------------------------------------------------
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Static serving for uploaded evidence (download endpoint also exists)
const UPLOAD_DIR = path.resolve(
  __dirname,
  "..",
  process.env.UPLOAD_DIR || "uploads"
);
app.use("/uploads", express.static(UPLOAD_DIR));

// Parse JWT (or optional dev header) into req.ctxUser / req.ctxAdmin
app.use(authenticate);

// --- Public -----------------------------------------------------------------
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "g08-dispute-resolution", time: new Date().toISOString() })
);

app.use("/api/auth", authRouter);

// --- Protected API (Bearer token or ALLOW_HEADER_AUTH) ----------------------
const api = express.Router();
api.use(requireUser);

api.use("/users", usersRouter);
api.use("/projects", projectsRouter);

api.use("/disputes", disputesRouter);
api.use("/disputes/:id/evidence", evidenceOnDisputeRouter);
api.use("/disputes/:id/mediation", mediationRouter);
api.use("/disputes/:id/arbitration", arbitrationRouter);
api.use("/disputes/:id/report", disputeReportRouter);
api.use("/disputes/:id/history", statusHistoryRouter);

api.use("/evidence", evidenceRouter);
api.use("/reports", reportRouter);
api.use("/admins", adminsRouter);
api.use("/admin/audit-log", auditLogRouter);

app.use("/api", api);

// --- 404 + error handlers ---------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// --- Start ------------------------------------------------------------------
const PORT = parseInt(process.env.PORT || "4000", 10);
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`G08 Dispute Resolution API listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
