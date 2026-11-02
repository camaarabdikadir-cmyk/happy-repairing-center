import { pool } from "../config/db.js";
export async function listPayments(req, res) {
  const { rows } = await pool.query(
    `SELECT rp.*, r.customer_name FROM repair_payments rp
     JOIN repairs r ON r.repair_id = rp.repair_id
     WHERE rp.repair_id=$1 ORDER BY rp.payment_id`, [req.params.repairId]
  );
  res.json(rows);
}
export async function addPayment(req, res) {
  const { amount_paid, payment_method, payment_date, note } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO repair_payments (repair_id, amount_paid, payment_method, payment_date, note)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [req.params.repairId, amount_paid, payment_method, payment_date || new Date(), note]
  );
  res.status(201).json(rows[0]);
}
