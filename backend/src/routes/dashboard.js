const router = require('express').Router();
const pool = require('../db/pool');
router.get('/', async (req, res) => {
  const [repairs, money, recent] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status = 'In Progress')::int AS in_progress, COUNT(*) FILTER (WHERE status = 'Delivered')::int AS delivered FROM repairs`),
    pool.query(`SELECT COALESCE((SELECT SUM(repair_cost) FROM repairs),0)::numeric AS billed, COALESCE((SELECT SUM(amount_paid) FROM repair_payments),0)::numeric AS paid`),
    pool.query(`SELECT r.repair_id, r.customer_name, r.brand, r.model, r.repair_cost, r.status FROM repairs r ORDER BY r.repair_id DESC LIMIT 8`)
  ]);
  res.json({
    repairs: repairs.rows[0],
    money: { billed: Number(money.rows[0].billed), paid: Number(money.rows[0].paid), outstanding: Number(money.rows[0].billed) - Number(money.rows[0].paid) },
    recent: recent.rows,
    low_stock: []
  });
});
module.exports = router;
