const router = require('express').Router();
const pool = require('../db/pool');
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY product_name');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { product_name, category, buy_price, sell_price, current_stock } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO products (product_name, category, buy_price, sell_price, current_stock) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [product_name, category || null, buy_price || 0, sell_price || 0, current_stock || 0]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/:id/sell', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { quantity, sell_price } = req.body;
    const { rows } = await client.query('SELECT * FROM products WHERE product_id = $1 FOR UPDATE', [req.params.id]);
    if (rows[0].current_stock < quantity) throw new Error('Stock kuma filna');
    await client.query('UPDATE products SET current_stock = current_stock - $1 WHERE product_id = $2', [quantity, req.params.id]);
    await client.query(`INSERT INTO stock_out (product_id, quantity, sell_price, date, note) VALUES ($1,$2,$3,CURRENT_DATE,'Sale')`, [req.params.id, quantity, sell_price]);
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) { await client.query('ROLLBACK'); res.status(500).json({ error: e.message }); } finally { client.release(); }
});
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE product_id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
