// Resets the database: drops everything, recreates the schema, then seeds it.
// Usage:  npm run db:reset
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { pool } = require("../config/db");

async function run(label, file) {
  const sql = fs.readFileSync(path.join(__dirname, file), "utf8");
  console.log(`\u2192 ${label} (${file})`);
  await pool.query(sql);
}

(async () => {
  try {
    await run("Applying schema", "schema.sql");
    await run("Seeding data",    "seed.sql");
    console.log("\u2713 Database reset complete.");
  } catch (err) {
    console.error("\u2717 Database reset failed:");
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
