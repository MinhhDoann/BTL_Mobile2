const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '352001',
  database: 'mobile2',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

app.get('/health', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    res.json({ ok: true, db: rows[0]?.ok === 1 });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.get('/api/home-data', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        g.genre_id,
        g.name AS genre_name,
        s.song_id,
        s.title,
        s.cover_url,
        s.audio_url,
        a.name AS artist_name
      FROM genres g
      LEFT JOIN song_genres sg ON g.genre_id = sg.genre_id
      LEFT JOIN songs s ON sg.song_id = s.song_id
      LEFT JOIN artists a ON s.artist_id = a.artist_id
      ORDER BY g.genre_id, s.song_id
    `);

    if (!rows.length) {
      return res.json([]);
    }

    const genresMap = {};
    rows.forEach((row) => {
      if (!genresMap[row.genre_id]) {
        genresMap[row.genre_id] = {
          genre_id: row.genre_id,
          genre_name: row.genre_name,
          songs: [],
        };
      }

      if (row.song_id) {
        genresMap[row.genre_id].songs.push({
          song_id: row.song_id,
          title: row.title,
          cover_url: row.cover_url,
          audio_url: row.audio_url,
          artist_name: row.artist_name,
        });
      }
    });

    return res.json(Object.values(genresMap));
  } catch (error) {
    console.error('LỖI SQL:', error);
    return res.status(500).json({
      error: 'Lỗi máy chủ',
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server API đang chạy tại: http://localhost:${PORT}`);
});


