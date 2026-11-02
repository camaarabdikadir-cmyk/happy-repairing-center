require('dotenv').config();
const express = require('express');
const cors = require('cors');
const auth = require('./src/middleware/auth');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/repairs', auth, require('./src/routes/repairs'));
app.use('/api/spare-parts', auth, require('./src/routes/spareParts'));
app.use('/api/dashboard', auth, require('./src/routes/dashboard'));
app.use('/api/payments', auth, require('./src/routes/payments'));
app.use('/api/products', auth, require('./src/routes/products'));
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});
const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`✅ Server-ku wuxuu ka shaqaynayaa: http://localhost:${port}`));
