const db = require('../config/db');

// 1. Lấy tất cả bài hát từ bảng `songs` kết hợp với thông tin nghệ sĩ từ bảng `artists`
const getAllSongs = async (req, res) => {
  try {
    const [songs] = await db.query(`
      SELECT 
        s.song_id, 
        s.title, 
        s.duration,
        s.cover_url, 
        s.audio_url, 
        s.play_count,
        s.lyrics,
        s.created_at,
        a.artist_id,
        a.name AS artist_name,
        a.avatar_url AS artist_avatar
      FROM songs s
      LEFT JOIN artists a ON s.artist_id = a.artist_id
      ORDER BY s.song_id DESC
    `);
    return res.json(songs);
  } catch (error) {
    console.error('LỖI LẤY DANH SÁCH BÀI HÁT:', error);
    return res.status(500).json({
      error: 'Lỗi máy chủ',
      details: error.message,
    });
  }
};

// 2. Lấy thông tin bài hát theo ID
const getSongById = async (req, res) => {
  const { id } = req.params;
  try {
    const [songs] = await db.query(`
      SELECT 
        s.song_id, 
        s.title, 
        s.duration,
        s.cover_url, 
        s.audio_url, 
        s.play_count,
        s.lyrics,
        a.artist_id,
        a.name AS artist_name,
        a.avatar_url AS artist_avatar
      FROM songs s
      LEFT JOIN artists a ON s.artist_id = a.artist_id
      WHERE s.song_id = ?
    `, [id]);

    if (!songs.length) {
      return res.status(404).json({ error: 'Không tìm thấy bài hát' });
    }

    return res.json(songs[0]);
  } catch (error) {
    console.error('LỖI LẤY CHI TIẾT BÀI HÁT:', error);
    return res.status(500).json({
      error: 'Lỗi máy chủ',
      details: error.message,
    });
  }
};

// 3. Cập nhật lượt phát (Play count)
const incrementPlayCount = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(`UPDATE songs SET play_count = play_count + 1 WHERE song_id = ?`, [id]);
    return res.json({ message: 'Đã tăng lượt phát', song_id: id });
  } catch (error) {
    console.error('LỖI CẬP NHẬT LƯỢT PHÁT:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ', details: error.message });
  }
};

module.exports = {
  getAllSongs,
  getSongById,
  incrementPlayCount,
};
