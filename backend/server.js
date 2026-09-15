const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const songRoutes = require('./routes/songRoutes');
const libraryRoutes = require('./routes/libraryRoutes');
const homeRoutes = require('./routes/homeRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Healthcheck endpoint
app.get('/health', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    res.json({ ok: true, db: rows[0]?.ok === 1 });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

// Đăng ký các Route API Backend
app.use('/api/songs', songRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/home-data', homeRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Backend Server đang chạy tại: http://localhost:${PORT}`);
});
