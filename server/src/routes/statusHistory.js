// /api/disputes/:id/history — full status timeline (FR-DR-13..16)
const express = require("express");
const { query } = require("../config/db");
const { serializeHistory } = require("../utils/serializers");

const router = express.Router({ mergeParams: true });

router.get("/", async (req, res, next) => {
  try {
    const did = parseInt(req.params.id, 10);
    const { rows } = await query(
      `SELECT h.*, u.name AS changed_by_name
         FROM dispute_status_history h
         JOIN users u ON u.id = h.changed_by
        WHERE h.dispute_id = $1
        ORDER BY h.changed_at`,
      [did]
    );
    res.json(rows.map(serializeHistory));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
