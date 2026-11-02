const router = require('express').Router();
const pool = require('../db/pool');
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY product_name');
    res.json(rows);
  } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const { product_name, category, buy_price, sell_price, current_stock } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO products (product_name, category, buy_price, sell_price, current_stock)
       VALUES ($1,$2,$3,$4, COALESCE($5,0)) RETURNING *`,
      [product_name, category || null, buy_price || 0, sell_price || 0, current_stock || 0]
    );
    res.status(201).json(rows[0]);
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM products WHERE product_id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { next(e); }
});
router.post('/:id/sell', async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const id = req.params.id;
    const { quantity, sell_price } = req.body;
    const qty = Number(quantity);
    const { rows } = await client.query('SELECT * FROM products WHERE product_id = $1 FOR UPDATE', [id]);
    const p = rows[0];
    if (!p) throw new Error('Product not found');
    if (p.current_stock < qty) throw new Error('Not enough stock');
    await client.query(
      `INSERT INTO stock_out (product_id, quantity, sell_price, date, note) VALUES ($1,$2,$3, CURRENT_DATE, 'Sale')`,
      [id, qty, sell_price || p.sell_price]
    );
    await client.query('UPDATE products SET current_stock = current_stock - $1 WHERE product_id = $2', [qty, id]);
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    next(e);
  } finally { client.release(); }
});
module.exports = router;
