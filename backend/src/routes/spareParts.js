const router = require('express').Router();
const pool = require('../db/pool');
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM spare_parts ORDER BY part_name');
  res.json(rows);
});
router.post('/', async (req, res) => {
  const b = req.body;
  const { rows } = await pool.query(
    `INSERT INTO spare_parts (part_name, brand, buy_price, sell_price, current_stock, minimum_stock) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [b.part_name, b.brand, b.buy_price, b.sell_price, b.current_stock || 0, b.minimum_stock || 5]
  );
  res.status(201).json(rows[0]);
});
router.post('/:id/stock-in', async (req, res) => {
  const { quantity, buy_price } = req.body;
  await pool.query(`INSERT INTO spare_parts_stock_in (part_id, quantity, buy_price, date) VALUES ($1,$2,$3,CURRENT_DATE)`, [req.params.id, quantity, buy_price]);
  await pool.query(`UPDATE spare_parts SET current_stock = current_stock + $1 WHERE part_id = $2`, [quantity, req.params.id]);
  res.json({ ok: true });
});
module.exports = router;
