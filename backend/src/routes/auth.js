const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const auth = require('../middleware/auth');
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ user_id: user.user_id, username: user.username, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user.user_id, username: user.username, role: user.role } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Not admin' });
    const { rows } = await pool.query('SELECT user_id, username, role, created_at FROM users ORDER BY user_id DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/users', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Not admin' });
    const { username, password, role } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query('INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING user_id, username, role', [username, hash, role]);
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/users/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Not admin' });
    await pool.query('DELETE FROM users WHERE user_id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
