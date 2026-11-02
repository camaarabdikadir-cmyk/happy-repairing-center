import { pool } from "../config/db.js";
export async function listRepairs(req, res) {
  const { status, search } = req.query;
  let q = `
    SELECT r.*, sp.part_name AS spare_part_name,
      COALESCE((SELECT SUM(amount_paid) FROM repair_payments rp WHERE rp.repair_id=r.repair_id),0) AS paid_amount
    FROM repairs r
    LEFT JOIN spare_parts sp ON sp.part_id = r.spare_part_id
    WHERE 1=1`;
  const params = [];
  if (status) { params.push(status); q += ` AND r.status=$${params.length}`; }
  if (search) {
    params.push(`%${search}%`);
    q += ` AND (r.customer_name ILIKE $${params.length} OR r.customer_phone ILIKE $${params.length})`;
  }
  q += " ORDER BY r.repair_id DESC";
  const { rows } = await pool.query(q, params);
  res.json(rows);
}
export async function getRepair(req, res) {
  const { rows } = await pool.query("SELECT * FROM repairs WHERE repair_id=$1", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "Not found" });
  const payments = await pool.query(
    "SELECT * FROM repair_payments WHERE repair_id=$1 ORDER BY payment_id", [req.params.id]
  );
  res.json({ ...rows[0], payments: payments.rows });
}
export async function createRepair(req, res) {
  const {
    customer_name, customer_phone, customer_address,
    device_type, brand, model, imei_serial,
    problem, repair_description, repair_cost,
    received_date, start_date, status, repair_type,
    spare_part_id, spare_part_quantity, spare_parts_cost,
  } = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO repairs
       (customer_name, customer_phone, customer_address, device_type, brand, model,
        imei_serial, problem, repair_description, repair_cost, received_date, start_date,
        status, repair_type, spare_part_id, spare_part_quantity, spare_parts_cost)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       RETURNING *`,
      [customer_name, customer_phone, customer_address, device_type, brand, model,
       imei_serial, problem, repair_description, repair_cost || 0,
       received_date, start_date, status || "In Progress",
       repair_type || "No Spare Part", spare_part_id || null,
       spare_part_quantity || 1, spare_parts_cost || 0]
    );
    const repair = rows[0];
    if (spare_part_id && spare_part_quantity > 0) {
      await client.query(
        `UPDATE spare_parts SET current_stock = current_stock - $1 WHERE part_id=$2`,
        [spare_part_quantity, spare_part_id]
      );
      await client.query(
        `INSERT INTO spare_parts_stock_out (part_id, quantity, sell_price, repair_id, date, note)
         VALUES ($1,$2,$3,$4,CURRENT_DATE,$5)`,
        [spare_part_id, spare_part_quantity, spare_parts_cost || 0,
         repair.repair_id, `Used for repair #${repair.repair_id}`]
      );
    }
    await client.query("COMMIT");
    res.status(201).json(repair);
  } catch (e) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
}
export async function updateRepair(req, res) {
  const { id } = req.params;
  const fields = [
    "customer_name","customer_phone","customer_address","device_type","brand","model",
    "imei_serial","problem","repair_description","repair_cost","received_date",
    "start_date","status","repair_type","spare_part_id","spare_part_quantity","spare_parts_cost"
  ];
  const sets = [], vals = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) { vals.push(req.body[f]); sets.push(`${f}=$${vals.length}`); }
  }
  if (!sets.length) return res.status(400).json({ error: "Nothing to update" });
  vals.push(id);
  const { rows } = await pool.query(
    `UPDATE repairs SET ${sets.join(", ")} WHERE repair_id=$${vals.length} RETURNING *`, vals
  );
  res.json(rows[0]);
}
export async function deleteRepair(req, res) {
  await pool.query("DELETE FROM repairs WHERE repair_id=$1", [req.params.id]);
  res.json({ ok: true });
}
