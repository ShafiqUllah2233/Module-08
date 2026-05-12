// /api/disputes/:id/evidence  +  /api/evidence/:id
// Handles evidence upload (multer), listing, visibility toggle, deletion.
const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { query } = require("../config/db");
const { httpError } = require("../middleware/error");
const { requireAdmin } = require("../middleware/auth");
const { logAudit } = require("../utils/audit");
const { serializeEvidence } = require("../utils/serializers");

const UPLOAD_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  process.env.UPLOAD_DIR || "uploads"
);
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_TYPES = new Set(["jpg", "jpeg", "png", "pdf", "docx", "zip"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]+/gi, "_");
    cb(null, `${Date.now()}_${base}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB cap
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase().slice(1);
    if (!ALLOWED_TYPES.has(ext)) {
      return cb(new Error(`Unsupported file type: ${ext}`));
    }
    cb(null, true);
  },
});

const disputeRouter = express.Router({ mergeParams: true });
const evidenceRouter = express.Router();

// --------------------------------------------------------------------------
// GET /api/disputes/:id/evidence
// --------------------------------------------------------------------------
disputeRouter.get("/", async (req, res, next) => {
  try {
    const did = parseInt(req.params.id, 10);
    const { rows } = await query(
      `SELECT e.*, u.display_name AS uploaded_by_name
         FROM dispute_evidence e
         JOIN users u ON u.id = e.uploaded_by
        WHERE e.dispute_id = $1
        ORDER BY e.uploaded_at`,
      [did]
    );
    // Non-admin callers see only files visible to parties.
    const isAdmin = !!(req.ctxAdmin && req.ctxAdmin.is_active);
    const filtered = isAdmin ? rows : rows.filter((r) => r.is_visible_to_parties);
    res.json(filtered.map(serializeEvidence));
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------------------
// POST /api/disputes/:id/evidence
// multipart/form-data:  file (single)  +  is_visible_to_parties (bool, optional)
// --------------------------------------------------------------------------
disputeRouter.post("/", upload.single("file"), async (req, res, next) => {
  try {
    const did = parseInt(req.params.id, 10);
    if (!req.file) throw httpError(400, "Field 'file' is required.");

    const dm = await query(
      "SELECT complainant_id, respondent_id FROM disputes WHERE id = $1",
      [did]
    );
    if (!dm.rows[0]) throw httpError(404, "Dispute not found.");
    const isAdminCtx = !!(req.ctxAdmin && req.ctxAdmin.is_active);
    const uid = req.ctxUser?.id;
    const partyUpload =
      uid === dm.rows[0].complainant_id || uid === dm.rows[0].respondent_id;
    if (!isAdminCtx && !partyUpload) {
      throw httpError(403, "Only dispute parties or admins may upload evidence.");
    }

    const ext = path.extname(req.file.originalname).toLowerCase().slice(1);
    const fileType = ext === "jpeg" ? "jpg" : ext;
    const sizeKb = Math.max(1, Math.round(req.file.size / 1024));
    const visible =
      req.body.is_visible_to_parties === "true" ||
      req.body.is_visible_to_parties === true;

    const ins = await query(
      `INSERT INTO dispute_evidence
         (dispute_id, uploaded_by, file_name, file_type, file_size_kb, file_path, is_visible_to_parties)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        did,
        req.ctxUser.id,
        req.file.originalname,
        fileType,
        sizeKb,
        path.relative(path.resolve(__dirname, "..", ".."), req.file.path),
        visible,
      ]
    );

    // First upload moves the dispute from 'submitted' -> 'evidence_uploaded'
    await query(
      `UPDATE disputes
          SET status = CASE WHEN status = 'submitted' THEN 'evidence_uploaded' ELSE status END,
              updated_at = NOW()
        WHERE id = $1`,
      [did]
    );

    res.status(201).json(serializeEvidence(ins.rows[0]));
  } catch (err) {
    // Roll back the file on the disk if the DB insert failed
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, () => {});
    }
    next(err);
  }
});

// --------------------------------------------------------------------------
// PATCH /api/evidence/:id/visibility   (admin only)
// Body: { is_visible_to_parties }
// --------------------------------------------------------------------------
evidenceRouter.patch("/:id/visibility", requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const visible = !!req.body.is_visible_to_parties;
    const upd = await query(
      `UPDATE dispute_evidence SET is_visible_to_parties = $1
        WHERE id = $2 RETURNING *`,
      [visible, id]
    );
    if (!upd.rows[0]) throw httpError(404, "Evidence not found.");

    await logAudit({
      adminId: req.ctxAdmin.id,
      actionType: "evidence_reviewed",
      targetEntityId: id,
      targetEntityType: "evidence",
      details: visible ? "Made visible to parties" : "Hidden from parties",
    });

    res.json(serializeEvidence(upd.rows[0]));
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------------------
// POST /api/evidence/:id/review   (admin marks evidence as reviewed)
// --------------------------------------------------------------------------
evidenceRouter.post("/:id/review", requireAdmin, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const ev = await query("SELECT id, dispute_id FROM dispute_evidence WHERE id = $1", [id]);
    if (!ev.rows[0]) throw httpError(404, "Evidence not found.");

    await query(
      `UPDATE dispute_evidence
          SET is_reviewed = TRUE,
              reviewed_by = $1,
              reviewed_at = NOW()
        WHERE id = $2`,
      [req.ctxAdmin.id, id]
    );

    await logAudit({
      adminId: req.ctxAdmin.id,
      actionType: "evidence_reviewed",
      targetEntityId: id,
      targetEntityType: "evidence",
      details: `Reviewed evidence on dispute #${ev.rows[0].dispute_id}`,
    });
    res.json({ id, reviewed: true });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------------------
// DELETE /api/evidence/:id  — uploader or admin (removes DB row and file)
// --------------------------------------------------------------------------
evidenceRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows } = await query(
      `SELECT e.id, e.file_path, e.uploaded_by, d.complainant_id, d.respondent_id
         FROM dispute_evidence e
         JOIN disputes d ON d.id = e.dispute_id
        WHERE e.id = $1`,
      [id]
    );
    const ev = rows[0];
    if (!ev) throw httpError(404, "Evidence not found.");

    const isAdmin = !!(req.ctxAdmin && req.ctxAdmin.is_active);
    const uid = req.ctxUser?.id;
    const party =
      uid === ev.uploaded_by ||
      uid === ev.complainant_id ||
      uid === ev.respondent_id;
    if (!isAdmin && !party) {
      throw httpError(403, "You may only delete your own uploads or act as an involved party.");
    }

    const abs = path.resolve(__dirname, "..", "..", ev.file_path);
    if (fs.existsSync(abs)) fs.unlink(abs, () => {});

    await query("DELETE FROM dispute_evidence WHERE id = $1", [id]);
    res.json({ id, deleted: true });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------------------------------
// GET /api/evidence/:id/download
// --------------------------------------------------------------------------
evidenceRouter.get("/:id/download", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows } = await query(
      "SELECT file_name, file_path, is_visible_to_parties FROM dispute_evidence WHERE id = $1",
      [id]
    );
    const ev = rows[0];
    if (!ev) throw httpError(404, "Evidence not found.");

    const isAdmin = !!(req.ctxAdmin && req.ctxAdmin.is_active);
    if (!isAdmin && !ev.is_visible_to_parties) {
      throw httpError(403, "This evidence is not visible to parties.");
    }

    const abs = path.resolve(__dirname, "..", "..", ev.file_path);
    if (!fs.existsSync(abs)) throw httpError(404, "File missing on disk.");
    res.download(abs, ev.file_name);
  } catch (err) {
    next(err);
  }
});

module.exports = { disputeRouter, evidenceRouter };
