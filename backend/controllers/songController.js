const db = require('../config/db');

// Lấy danh sách tất cả bài hát kết hợp với tên ca sĩ
const getAllSongs = async (req, res) => {
  try {
    const [songs] = await db.query(`
      SELECT 
        s.song_id, 
        s.title, 
        s.cover_url, 
        s.audio_url, 
        a.name AS artist_name
      FROM songs s
      LEFT JOIN artists a ON s.artist_id = a.artist_id
      ORDER BY s.song_id DESC
    `);
    return res.json(songs);
  } catch (error) {
    console.error('LỖI LẤY BÀI HÁT:', error);
    return res.status(500).json({
      error: 'Lỗi máy chủ',
      details: error.message,
    });
  }
};

module.exports = {
  getAllSongs,
};
