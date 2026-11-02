const router = require('express').Router();
const pool = require('../db/pool');
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT p.*, r.customer_name FROM repair_payments p JOIN repairs r ON r.repair_id = p.repair_id ORDER BY p.payment_id DESC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { repair_id, amount_paid, payment_method, note } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO repair_payments (repair_id, amount_paid, payment_method, payment_date, note) VALUES ($1,$2,$3,CURRENT_DATE,$4) RETURNING *`,
      [repair_id, amount_paid, payment_method || 'Cash', note || '']
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
