const router = require('express').Router();
const pool = require('../db/pool');
// Soo qaado dhammaan Repairs-ka
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.*, 
             COALESCE((SELECT SUM(amount_paid) FROM repair_payments p WHERE p.repair_id = r.repair_id), 0)::numeric AS paid
      FROM repairs r 
      ORDER BY r.repair_id DESC
    `);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
// Soo qaado HAL Repair oo kaliya (Tani waa tan Invoice-ku u baahan yahay)
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT r.*, 
             COALESCE((SELECT SUM(amount_paid) FROM repair_payments p WHERE p.repair_id = r.repair_id), 0)::numeric AS paid
      FROM repairs r 
      WHERE r.repair_id = $1
    `, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Repair-ka lama helin' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
// Ku dar Repair Cusub
router.post('/', async (req, res) => {
  const b = req.body;
  try {
    const { rows } = await pool.query(`
      INSERT INTO repairs 
      (customer_name, customer_phone, customer_address, device_type, brand, model, imei_serial, problem, repair_cost, received_date, status, repair_type, spare_part_id, spare_part_quantity) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,CURRENT_DATE,$10,$11,$12,$13) RETURNING *
    `, [b.customer_name, b.customer_phone, b.customer_address, b.device_type, b.brand, b.model, b.imei_serial, b.problem, b.repair_cost, b.status || 'In Progress', b.repair_type || 'No Spare Part', b.spare_part_id || null, b.spare_part_quantity || 1]);
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
// Cusboonaysii Status-ka
router.put('/:id', async (req, res) => {
  try {
    await pool.query('UPDATE repairs SET status = $1 WHERE repair_id = $2', [req.body.status, req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
// Tirtir Repair-ka
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM repairs WHERE repair_id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
