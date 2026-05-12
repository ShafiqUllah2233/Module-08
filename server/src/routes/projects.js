// Project lookup for New Dispute and dispute joins — reads centralized `projects` + `escrow_accounts`.
const express = require("express");
const { query } = require("../config/db");
const { httpError } = require("../middleware/error");
const {
  escrowStatusToPaymentStatus,
  contractStatusToDisplay,
} = require("../utils/paymentLabels");

const router = express.Router();

const PROJECT_BASE = `
  SELECT p.id,
         p.title AS project_title,
         p.status::text AS contract_status_raw,
         p.client_id,
         p.freelancer_id,
         p.agreed_amount,
         p.created_at,
         COALESCE(ea.total_amount, p.agreed_amount) AS escrow_amount,
         COALESCE(ea.escrow_status::text, 'pending') AS payment_status_raw
    FROM projects p
    LEFT JOIN escrow_accounts ea ON ea.project_id = p.id
`;

function mapProjectRow(r) {
  const { contract_status_raw, payment_status_raw, ...rest } = r;
  return {
    ...rest,
    contract_status: contractStatusToDisplay(contract_status_raw),
    payment_status: escrowStatusToPaymentStatus(payment_status_raw),
  };
}

router.get("/", async (req, res, next) => {
  try {
    const params = [];
    const where = [];
    if (req.query.client_id) {
      params.push(req.query.client_id);
      where.push(`p.client_id = $${params.length}`);
    }
    if (req.query.freelancer_id) {
      params.push(req.query.freelancer_id);
      where.push(`p.freelancer_id = $${params.length}`);
    }
    if (req.query.q) {
      params.push(`%${req.query.q}%`);
      where.push(
        `(p.title ILIKE $${params.length} OR CAST(p.id AS TEXT) ILIKE $${params.length})`
      );
    }
    const sql =
      PROJECT_BASE +
      (where.length ? " WHERE " + where.join(" AND ") : "") +
      " ORDER BY p.id";
    const { rows } = await query(sql, params);
    res.json(rows.map(mapProjectRow));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rows } = await query(
      `SELECT p.id,
              p.title AS project_title,
              p.status::text AS contract_status_raw,
              p.client_id,
              p.freelancer_id,
              p.agreed_amount,
              p.created_at,
              COALESCE(ea.total_amount, p.agreed_amount) AS escrow_amount,
              COALESCE(ea.escrow_status::text, 'pending') AS payment_status_raw,
              c.display_name AS client_name,
              f.display_name AS freelancer_name
         FROM projects p
         LEFT JOIN escrow_accounts ea ON ea.project_id = p.id
         JOIN users c ON c.id = p.client_id
         JOIN users f ON f.id = p.freelancer_id
        WHERE p.id = $1`,
      [id]
    );
    if (!rows[0]) throw httpError(404, "Project not found.");
    res.json(mapProjectRow(rows[0]));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
