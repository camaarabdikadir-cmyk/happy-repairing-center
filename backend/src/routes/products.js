const router = require('express').Router();
const pool = require('../db/pool');
// 1. Soo qaado dhammaan alaabta
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY product_name');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
// 2. Soo qaado Taariikhda Iibka
router.get('/history', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT so.stock_out_id, so.quantity, so.sell_price, so.date, so.note, p.product_name, p.category 
      FROM stock_out so 
      JOIN products p ON p.product_id = so.product_id 
      ORDER BY so.stock_out_id DESC
    `);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
// 3. Ku dar alaab cusub
router.post('/', async (req, res) => {
  try {
    const { product_name, category, buy_price, sell_price, current_stock } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO products (product_name, category, buy_price, sell_price, current_stock) VALUES ($1,$2,$3,$4, COALESCE($5,0)) RETURNING *`,
      [product_name, category || null, buy_price || 0, sell_price || 0, current_stock || 0]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
// 4. Wax ka beddel Alaabta (Edit)
router.put('/:id', async (req, res) => {
  try {
    const { product_name, category, buy_price, sell_price, current_stock } = req.body;
    const { rows } = await pool.query(
      `UPDATE products SET product_name = $1, category = $2, buy_price = $3, sell_price = $4, current_stock = $5 WHERE product_id = $6 RETURNING *`,
      [product_name, category || null, buy_price || 0, sell_price || 0, current_stock || 0, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Alaabta lama helin' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
// 5. Tirtir alaabta
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM products WHERE product_id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
// 6. IIB ALAABTA (Halkan ayaa note lagu kaydinayaa)
router.post('/:id/sell', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { quantity, sell_price, note } = req.body;
    const qty = Number(quantity);
    const { rows } = await client.query('SELECT * FROM products WHERE product_id = $1 FOR UPDATE', [req.params.id]);
    const p = rows[0];
    if (!p) throw new Error('Alaabta lama helin');
    if (p.current_stock < qty) throw new Error('Stock kuma filna');
    await client.query(
      `INSERT INTO stock_out (product_id, quantity, sell_price, date, note) VALUES ($1,$2,$3,CURRENT_DATE,$4)`,
      [req.params.id, qty, sell_price || p.sell_price, note || 'Sale']
    );
    await client.query('UPDATE products SET current_stock = current_stock - $1 WHERE product_id = $2', [qty, req.params.id]);
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally { client.release(); }
});
// 7. STOCK IN (Alaab soo kordhi)
router.post('/:id/stock-in', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { quantity, buy_price, note } = req.body;
    const qty = Number(quantity);
    await client.query(
      `INSERT INTO stock_in (product_id, quantity, buy_price, date, note) VALUES ($1,$2,$3,CURRENT_DATE,$4)`,
      [req.params.id, qty, buy_price || 0, note || 'Stock In']
    );
    await client.query('UPDATE products SET current_stock = current_stock + $1 WHERE product_id = $2', [qty, req.params.id]);
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally { client.release(); }
});
module.exports = router;
