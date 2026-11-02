import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const result = await pool.query("SELECT NOW() AS now, version() AS version");
console.log("✅ Connected!");
console.log("🕐 Time:", result.rows[0].now);
console.log("🐘 Version:", result.rows[0].version.split(",")[0]);
await pool.end();