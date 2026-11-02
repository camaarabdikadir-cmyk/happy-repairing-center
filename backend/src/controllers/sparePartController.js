import { pool } from "../config/db.js";
export async function listParts(req, res) {
  const { rows } = await pool.query("SELECT * FROM spare_parts ORDER BY part_id DESC");
  res.json(rows);
}
export async function createPart(req, res) {
  const { part_name, brand, buy_price, sell_price, current_stock, minimum_stock } = req.body;
  const { rows } = await pool.query(
    `INSERT INTO spare_parts (part_name, brand, buy_price, sell_price, current_stock, minimum_stock)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [part_name, brand, buy_price, sell_price, current_stock || 0, minimum_stock || 5]
  );
  res.status(201).json(rows[0]);
}
export async function updatePart(req, res) {
  const { part_name, brand, buy_price, sell_price, minimum_stock } = req.body;
  const { rows } = await pool.query(
    `UPDATE spare_parts SET part_name=$1, brand=$2, buy_price=$3, sell_price=$4, minimum_stock=$5
     WHERE part_id=$6 RETURNING *`,
    [part_name, brand, buy_price, sell_price, minimum_stock, req.params.id]
  );
  res.json(rows[0]);
}
export async function deletePart(req, res) {
  await pool.query("DELETE FROM spare_parts WHERE part_id=$1", [req.params.id]);
  res.json({ ok: true });
}
export async function stockIn(req, res) {
  const { part_id, quantity, buy_price, note } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(
      `INSERT INTO spare_parts_stock_in (part_id, quantity, buy_price, date, note)
       VALUES ($1,$2,$3,CURRENT_DATE,$4)`,
      [part_id, quantity, buy_price, note]
    );
    await client.query(
      `UPDATE spare_parts SET current_stock = current_stock + $1 WHERE part_id=$2`,
      [quantity, part_id]
    );
    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: e.message });
  } finally { client.release(); }
}
