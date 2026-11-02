import { pool } from "../config/db.js";
export async function stats(req, res) {
  const total = await pool.query("SELECT COUNT(*) FROM repairs");
  const inProgress = await pool.query("SELECT COUNT(*) FROM repairs WHERE status='In Progress'");
  const delivered = await pool.query("SELECT COUNT(*) FROM repairs WHERE status='Delivered'");
  const revenue = await pool.query("SELECT COALESCE(SUM(amount_paid),0) AS v FROM repair_payments");
  const lowStock = await pool.query(
    "SELECT * FROM spare_parts WHERE current_stock <= minimum_stock"
  );
  res.json({
    total_repairs: Number(total.rows[0].count),
    in_progress: Number(inProgress.rows[0].count),
    delivered: Number(delivered.rows[0].count),
    revenue: Number(revenue.rows[0].v),
    low_stock: lowStock.rows,
  });
}
