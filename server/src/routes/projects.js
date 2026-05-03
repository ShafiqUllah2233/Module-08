// Lightweight project lookup so the New Dispute form can validate / autocomplete.
// Project records originate in Modules 3/4; this route reads only.
const express = require("express");
const { query } = require("../config/db");
const { httpError } = require("../middleware/error");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const params = [];
    const where = [];
    if (req.query.client_id) {
      params.push(req.query.client_id);
      where.push(`client_id = $${params.length}`);
    }
    if (req.query.freelancer_id) {
      params.push(req.query.freelancer_id);
      where.push(`freelancer_id = $${params.length}`);
    }
    if (req.query.q) {
      params.push(`%${req.query.q}%`);
      where.push(
        `(project_title ILIKE $${params.length} OR CAST(id AS TEXT) ILIKE $${params.length})`
      );
    }
    const sql =
      "SELECT * FROM projects" +
      (where.length ? " WHERE " + where.join(" AND ") : "") +
      " ORDER BY id";
    const { rows } = await query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows } = await query(
      `SELECT p.*, c.name AS client_name, f.name AS freelancer_name
         FROM projects p
         JOIN users c ON c.id = p.client_id
         JOIN users f ON f.id = p.freelancer_id
        WHERE p.id = $1`,
      [id]
    );
    if (!rows[0]) throw httpError(404, "Project not found.");
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
