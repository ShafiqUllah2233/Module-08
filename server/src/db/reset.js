// Resets the database: drops public schema, applies centralized schema, then seeds Module 8 demo data.
// Usage:  npm run db:reset
require("dotenv").config({ override: true });
const fs = require("fs");
const path = require("path");
const { pool } = require("../config/db");

async function runSql(client, label, file) {
  const sql = fs.readFileSync(path.join(__dirname, file), "utf8");
  console.log(`\u2192 ${label} (${file})`);
  await client.query(sql);
}

(async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("DROP SCHEMA IF EXISTS public CASCADE");
    await client.query("CREATE SCHEMA public");
    await client.query("GRANT ALL ON SCHEMA public TO postgres");
    await client.query("GRANT ALL ON SCHEMA public TO PUBLIC");
    await runSql(client, "Applying centralized schema", "schema.sql");
    await runSql(client, "Seeding Module 8 demo data", "seed.sql");
    await client.query("COMMIT");
    console.log("\u2713 Database reset complete.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("\u2717 Database reset failed:");
    console.error(err.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
})();
