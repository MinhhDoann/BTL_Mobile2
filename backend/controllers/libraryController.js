const db = require('../config/db');

// 1. Lấy tổng quan Thư viện của User (Playlists, Liked Songs count)
const getUserLibrary = async (req, res) => {
  const userId = req.query.user_id || 2; // Default demo user_id = 2

  try {
    // Lấy danh sách Playlists của User
    const [playlists] = await db.query(`
      SELECT 
        p.playlist_id, 
        p.title, 
        p.description, 
        p.cover_url, 
        COUNT(ps.song_id) AS total_songs
      FROM playlists p
      LEFT JOIN playlist_songs ps ON p.playlist_id = ps.playlist_id
      WHERE p.user_id = ?
      GROUP BY p.playlist_id
      ORDER BY p.created_at DESC
    `, [userId]);

    // Đếm số lượng Bài hát yêu thích (Liked Songs)
    const [likedCount] = await db.query(`
      SELECT COUNT(*) AS total_liked
      FROM user_favorite_songs
      WHERE user_id = ?
    `, [userId]);

    // Lấy danh sách Nghệ sĩ
    const [artists] = await db.query(`
      SELECT artist_id, name, avatar_url 
      FROM artists 
      LIMIT 10
    `);

    return res.json({
      playlists,
      liked_songs_count: likedCount[0]?.total_liked || 0,
      followed_artists: artists,
    });
  } catch (error) {
    console.error('LỖI LẤY THƯ VIỆN:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ', details: error.message });
  }
};

// 2. Lấy danh sách Bài hát yêu thích (Liked Songs)
const getFavoriteSongs = async (req, res) => {
  const userId = req.query.user_id || 2;

  try {
    const [songs] = await db.query(`
      SELECT 
        s.song_id, 
        s.title, 
        s.cover_url, 
        s.audio_url, 
        a.name AS artist_name
      FROM user_favorite_songs ufs
      JOIN songs s ON ufs.song_id = s.song_id
      LEFT JOIN artists a ON s.artist_id = a.artist_id
      WHERE ufs.user_id = ?
      ORDER BY ufs.liked_at DESC
    `, [userId]);

    return res.json(songs);
  } catch (error) {
    console.error('LỖI LẤY BÀI HÁT YÊU THÍCH:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ', details: error.message });
  }
};

// 3. Lấy chi tiết bài hát trong 1 Playlist
const getPlaylistDetails = async (req, res) => {
  const { playlistId } = req.params;

  try {
    const [playlistInfo] = await db.query(`
      SELECT playlist_id, title, description, cover_url 
      FROM playlists 
      WHERE playlist_id = ?
    `, [playlistId]);

    if (!playlistInfo.length) {
      return res.status(404).json({ error: 'Không tìm thấy Playlist' });
    }

    const [songs] = await db.query(`
      SELECT 
        s.song_id, 
        s.title, 
        s.cover_url, 
        s.audio_url, 
        a.name AS artist_name
      FROM playlist_songs ps
      JOIN songs s ON ps.song_id = s.song_id
      LEFT JOIN artists a ON s.artist_id = a.artist_id
      WHERE ps.playlist_id = ?
      ORDER BY ps.order_index ASC
    `, [playlistId]);

    return res.json({
      playlist: playlistInfo[0],
      songs,
    });
  } catch (error) {
    console.error('LỖI LẤY CHI TIẾT PLAYLIST:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ', details: error.message });
  }
};

// 4. Tạo Playlist mới
const createPlaylist = async (req, res) => {
  const { title, description, user_id = 2 } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Tên playlist không được để trống' });
  }

  try {
    const [result] = await db.query(`
      INSERT INTO playlists (user_id, title, description)
      VALUES (?, ?, ?)
    `, [user_id, title, description || '']);

    return res.json({
      message: 'Tạo playlist thành công',
      playlist_id: result.insertId,
      title,
    });
  } catch (error) {
    console.error('LỖI TẠO PLAYLIST:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ', details: error.message });
  }
};

module.exports = {
  getUserLibrary,
  getFavoriteSongs,
  getPlaylistDetails,
  createPlaylist,
};
