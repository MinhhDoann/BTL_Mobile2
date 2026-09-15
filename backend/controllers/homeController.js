const db = require('../config/db');

// Lấy dữ liệu trang chủ gồm thể loại và danh sách bài hát theo thể loại
const getHomeData = async (req, res) => {
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
    console.error('LỖI DỮ LIỆU TRANG CHỦ:', error);
    return res.status(500).json({
      error: 'Lỗi máy chủ',
      details: error.message,
    });
  }
};

module.exports = {
  getHomeData,
};
