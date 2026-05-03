// Express entry point for the G08 Dispute Resolution API.
require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { ctxUser } = require("./middleware/ctxUser");
const { notFound, errorHandler } = require("./middleware/error");

const disputesRouter   = require("./routes/disputes");
const { disputeRouter: evidenceOnDisputeRouter,
        evidenceRouter } = require("./routes/evidence");
const mediationRouter  = require("./routes/mediation");
const arbitrationRouter = require("./routes/arbitration");
const { disputeReportRouter, reportRouter } = require("./routes/reports");
const statusHistoryRouter = require("./routes/statusHistory");
const adminsRouter     = require("./routes/admins");
const auditLogRouter   = require("./routes/auditLog");
const usersRouter      = require("./routes/users");
const projectsRouter   = require("./routes/projects");

const app = express();

// --- Core middleware ---------------------------------------------------------
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Static serving for uploaded evidence (download endpoint also exists)
const UPLOAD_DIR = path.resolve(
  __dirname,
  "..",
  process.env.UPLOAD_DIR || "uploads"
);
app.use("/uploads", express.static(UPLOAD_DIR));

// "Who is calling" context for every route
app.use(ctxUser);

// --- Health check ------------------------------------------------------------
app.get("/api/health", (_req, res) =>
  res.json({ ok: true, service: "g08-dispute-resolution", time: new Date().toISOString() })
);

// --- Routers ----------------------------------------------------------------
app.use("/api/users", usersRouter);
app.use("/api/projects", projectsRouter);

app.use("/api/disputes", disputesRouter);
app.use("/api/disputes/:id/evidence",  evidenceOnDisputeRouter);
app.use("/api/disputes/:id/mediation", mediationRouter);
app.use("/api/disputes/:id/arbitration", arbitrationRouter);
app.use("/api/disputes/:id/report",    disputeReportRouter);
app.use("/api/disputes/:id/history",   statusHistoryRouter);

app.use("/api/evidence", evidenceRouter);
app.use("/api/reports",  reportRouter);
app.use("/api/admins",   adminsRouter);
app.use("/api/admin/audit-log", auditLogRouter);

// --- 404 + error handlers ---------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// --- Start ------------------------------------------------------------------
const PORT = parseInt(process.env.PORT || "4000", 10);
app.listen(PORT, () => {
  console.log(`G08 Dispute Resolution API listening on http://localhost:${PORT}`);
});
