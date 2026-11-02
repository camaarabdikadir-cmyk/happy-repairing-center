import "dotenv/config";
import bcrypt from "bcryptjs";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    console.log("🔄 Waan abuurayaa user-ka admin...");
    
    // Samee hash cusub oo Node.js ah
    const hash = await bcrypt.hash("admin123", 10);
    
    // Tirtir admin hore haddii uu jiro
    await pool.query("DELETE FROM users WHERE username = 'admin'");
    
    // Ku dar admin cusub
    await pool.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
      ["admin", hash, "admin"]
    );
    
    console.log("✅ User admin si guul leh ayaa loo abuuray!");
    console.log("   Username: admin");
    console.log("   Password: admin123");
  } catch (err) {
    console.error("❌ Khalad:", err.message);
  } finally {
    await pool.end();
  }
}

run();