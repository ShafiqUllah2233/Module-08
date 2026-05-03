// Single shared PG pool. Loaded once and reused by every controller.
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle PG client", err);
});

// Convenience wrapper that mirrors the `query()` signature
// while keeping a single source of truth for the pool.
async function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
