const router = require('express').Router();
const pool = require('../db/pool');
router.get('/', async (req, res) => {
  try {
    const { filter } = req.query; // all, daily, weekly, monthly, yearly
    let dateRepairs = "";
    let datePayments = "";
    let dateSales = "";
    if (filter === 'daily') {
      dateRepairs = "WHERE received_date = CURRENT_DATE";
      datePayments = "WHERE payment_date = CURRENT_DATE";
      dateSales = "WHERE so.date = CURRENT_DATE";
    } else if (filter === 'weekly') {
      dateRepairs = "WHERE received_date >= CURRENT_DATE - INTERVAL '7 days'";
      datePayments = "WHERE payment_date >= CURRENT_DATE - INTERVAL '7 days'";
      dateSales = "WHERE so.date >= CURRENT_DATE - INTERVAL '7 days'";
    } else if (filter === 'monthly') {
      dateRepairs = "WHERE received_date >= DATE_TRUNC('month', CURRENT_DATE)";
      datePayments = "WHERE payment_date >= DATE_TRUNC('month', CURRENT_DATE)";
      dateSales = "WHERE so.date >= DATE_TRUNC('month', CURRENT_DATE)";
    } else if (filter === 'yearly') {
      dateRepairs = "WHERE received_date >= DATE_TRUNC('year', CURRENT_DATE)";
      datePayments = "WHERE payment_date >= DATE_TRUNC('year', CURRENT_DATE)";
      dateSales = "WHERE so.date >= DATE_TRUNC('year', CURRENT_DATE)";
    }
    const [repairs, money, recent, sales, users, parts] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total,
                         COUNT(*) FILTER (WHERE status = 'In Progress')::int AS in_progress,
                         COUNT(*) FILTER (WHERE status = 'Delivered')::int AS delivered
                  FROM repairs ${dateRepairs}`),
      pool.query(`SELECT 
                    COALESCE((SELECT SUM(repair_cost) FROM repairs ${dateRepairs}), 0)::numeric AS billed,
                    COALESCE((SELECT SUM(amount_paid) FROM repair_payments ${datePayments}), 0)::numeric AS paid`),
      pool.query(`SELECT r.repair_id, r.customer_name, r.brand, r.model, r.repair_cost, r.status
                  FROM repairs r ${dateRepairs} ORDER BY r.repair_id DESC LIMIT 5`),
      pool.query(`SELECT 
                    COALESCE(SUM(so.quantity), 0)::int AS qty_sold,
                    COALESCE(SUM(so.quantity * so.sell_price), 0)::numeric AS revenue,
                    COALESCE(SUM(so.quantity * (so.sell_price - p.buy_price)), 0)::numeric AS profit
                  FROM stock_out so JOIN products p ON p.product_id = so.product_id ${dateSales}`),
      pool.query(`SELECT COUNT(*)::int AS total FROM users`),
      pool.query(`SELECT COALESCE(SUM(current_stock), 0)::int AS total_parts FROM spare_parts`)
    ]);
    const billed = Number(money.rows[0].billed);
    const paid = Number(money.rows[0].paid);
    res.json({
      repairs: repairs.rows[0],
      money: { billed, paid, outstanding: billed - paid },
      recent: recent.rows,
      sales: sales.rows[0],
      users: users.rows[0].total,
      stock_parts: parts.rows[0].total_parts
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
