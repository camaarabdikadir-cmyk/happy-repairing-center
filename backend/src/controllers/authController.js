import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
export async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username/password required" });
  const { rows } = await pool.query("SELECT * FROM users WHERE username=$1", [username]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign(
    { id: user.user_id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  res.json({
    token,
    user: { id: user.user_id, username: user.username, role: user.role },
  });
}
