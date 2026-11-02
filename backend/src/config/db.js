import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pg;
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
pool.connect()
  .then((c) => {
    console.log("✅ Neon PostgreSQL connected");
    c.release();
  })
  .catch((e) => console.error("❌ DB error:", e.message));
