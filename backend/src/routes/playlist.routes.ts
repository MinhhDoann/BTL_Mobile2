import { Router, Request, Response } from 'express';
import { db } from '../config/db';

export const playlistRouter = Router();

// GET /api/library - Lấy toàn bộ danh mục thư viện (playlists theo từng tài khoản, albums, artists)
playlistRouter.get('/library', async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id ? Number(req.query.user_id) : null;

    let playlistQuery = `
      SELECT
        p.playlist_id AS id,
        p.title,
        CONCAT(COUNT(ps.song_id), ' bài hát') AS subtitle,
        'playlist' AS type,
        p.cover_url
      FROM playlists p
      LEFT JOIN playlist_songs ps ON ps.playlist_id = p.playlist_id
    `;
    const playlistParams: any[] = [];
    if (userId) {
      playlistQuery += ` WHERE p.user_id = ? `;
      playlistParams.push(userId);
    } else {
      // Nếu chưa có user_id (chưa đăng nhập), không hiển thị playlist của tài khoản khác
      playlistQuery += ` WHERE 1 = 0 `;
    }
    playlistQuery += `
      GROUP BY p.playlist_id, p.title, p.cover_url
      ORDER BY p.created_at DESC
    `;

    const [playlists]: [any[], any] = await db.query(playlistQuery, playlistParams);

    const [albums]: [any[], any] = await db.query(`
      SELECT
        MAX(al.album_id) AS id,
        al.title,
        COALESCE(MAX(ar.name), 'Album') AS subtitle,
        'album' AS type,
        MAX(al.cover_url) AS cover_url
      FROM albums al
      LEFT JOIN artists ar ON ar.artist_id = al.artist_id
      GROUP BY al.title
      ORDER BY MAX(al.release_date) DESC
    `);

    const [artists]: [any[], any] = await db.query(`
      SELECT
        MAX(ar.artist_id) AS id,
        ar.name AS title,
        'Nghệ sĩ' AS subtitle,
        'artist' AS type,
        MAX(ar.avatar_url) AS cover_url
      FROM artists ar
      GROUP BY ar.name
      ORDER BY ar.name ASC
    `);

    const items = [...playlists, ...albums, ...artists];
    return res.json({ items });
  } catch (error: any) {
    console.error('Lỗi API /library:', error);
    return res.status(500).json({ message: 'Lỗi tải thư viện', error: error.message });
  }
});

// GET /api/playlists - Lấy danh sách playlist (lọc theo user_id nếu có)
playlistRouter.get('/playlists', async (req: Request, res: Response) => {
  try {
    const userId = req.query.user_id ? Number(req.query.user_id) : null;
    let query = `
      SELECT
        p.playlist_id AS id,
        p.title,
        p.description,
        p.cover_url,
        COUNT(ps.song_id) AS song_count,
        p.created_at
      FROM playlists p
      LEFT JOIN playlist_songs ps ON ps.playlist_id = p.playlist_id
    `;
    const params: any[] = [];
    if (userId) {
      query += ` WHERE p.user_id = ? `;
      params.push(userId);
    } else if (req.query.all !== 'true') {
      // Khi không truyền user_id và không chỉ định all=true, không hiển thị playlist riêng
      query += ` WHERE 1 = 0 `;
    }
    query += `
      GROUP BY p.playlist_id, p.title, p.description, p.cover_url, p.created_at
      ORDER BY p.created_at DESC
    `;
    const [rows]: [any[], any] = await db.query(query, params);
    return res.json(rows);
  } catch (error: any) {
    console.error('Lỗi GET /playlists:', error);
    return res.status(500).json({ message: 'Lỗi máy chủ', error: error.message });
  }
});

// POST /api/playlists - Tạo danh sách phát mới
playlistRouter.post('/playlists', async (req: Request, res: Response) => {
  try {
    const { title, description, user_id } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Tên danh sách phát không được để trống.' });
    }

    if (!user_id) {
      return res.status(400).json({ message: 'Vui lòng đăng nhập để tạo danh sách phát.' });
    }

    const userId = Number(user_id);
    const [result]: [any, any] = await db.query(
      `INSERT INTO playlists (user_id, title, description, is_public) VALUES (?, ?, ?, TRUE)`,
      [userId, title.trim(), description || '']
    );

    return res.status(201).json({
      message: 'Tạo danh sách phát thành công',
      playlist_id: result.insertId,
      title: title.trim(),
    });
  } catch (error: any) {
    console.error('Lỗi POST /playlists:', error);
    return res.status(500).json({ message: 'Không thể tạo danh sách phát', error: error.message });
  }
});

// GET /api/playlists/:id - Chi tiết playlist và danh sách bài hát bên trong
playlistRouter.get('/playlists/:id', async (req: Request, res: Response) => {
  try {
    const playlistId = Number(req.params.id);
    if (!playlistId || !Number.isFinite(playlistId)) {
      return res.status(400).json({ message: 'ID danh sách phát không hợp lệ.' });
    }

    const [playlistRows]: [any[], any] = await db.query(
      `SELECT playlist_id, title, description, cover_url, created_at FROM playlists WHERE playlist_id = ?`,
      [playlistId]
    );

    if (!playlistRows.length) {
      return res.status(404).json({ message: 'Không tìm thấy danh sách phát.' });
    }

    const playlist = playlistRows[0];

    const [songs]: [any[], any] = await db.query(
      `
      SELECT
        s.song_id,
        s.title,
        s.duration,
        s.audio_url,
        s.cover_url,
        a.name AS artist_name,
        ps.added_at
      FROM playlist_songs ps
      JOIN songs s ON s.song_id = ps.song_id
      LEFT JOIN artists a ON a.artist_id = s.artist_id
      WHERE ps.playlist_id = ?
      ORDER BY ps.order_index ASC, ps.added_at DESC
    `,
      [playlistId]
    );

    return res.json({
      playlist,
      songs,
    });
  } catch (error: any) {
    console.error('Lỗi GET /playlists/:id:', error);
    return res.status(500).json({ message: 'Lỗi tải danh sách phát', error: error.message });
  }
});

// POST /api/playlists/:id/songs - Thêm bài hát vào danh sách phát
playlistRouter.post('/playlists/:id/songs', async (req: Request, res: Response) => {
  try {
    const playlistId = Number(req.params.id);
    const { song_id } = req.body;
    const songId = Number(song_id);

    if (!playlistId || !songId) {
      return res.status(400).json({ message: 'ID danh sách phát hoặc ID bài hát không hợp lệ.' });
    }

    // Chèn vào bảng playlist_songs nếu chưa có
    await db.query(
      `INSERT IGNORE INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)`,
      [playlistId, songId]
    );

    return res.json({ message: 'Đã thêm bài hát vào danh sách phát thành công.' });
  } catch (error: any) {
    console.error('Lỗi POST /playlists/:id/songs:', error);
    return res.status(500).json({ message: 'Không thể thêm bài hát', error: error.message });
  }
});

// DELETE /api/playlists/:id/songs/:songId - Xóa bài hát khỏi danh sách phát
playlistRouter.delete('/playlists/:id/songs/:songId', async (req: Request, res: Response) => {
  try {
    const playlistId = Number(req.params.id);
    const songId = Number(req.params.songId);

    if (!playlistId || !songId) {
      return res.status(400).json({ message: 'Tham số không hợp lệ.' });
    }

    await db.query(`DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?`, [playlistId, songId]);
    return res.json({ message: 'Đã xóa bài hát khỏi danh sách phát.' });
  } catch (error: any) {
    console.error('Lỗi DELETE /playlists/:id/songs/:songId:', error);
    return res.status(500).json({ message: 'Không thể xóa bài hát', error: error.message });
  }
});

// DELETE /api/playlists/:id - Xóa danh sách phát
playlistRouter.delete('/playlists/:id', async (req: Request, res: Response) => {
  try {
    const playlistId = Number(req.params.id);
    if (!playlistId) return res.status(400).json({ message: 'ID không hợp lệ.' });

    await db.query(`DELETE FROM playlists WHERE playlist_id = ?`, [playlistId]);
    return res.json({ message: 'Đã xóa danh sách phát.' });
  } catch (error: any) {
    console.error('Lỗi DELETE /playlists/:id:', error);
    return res.status(500).json({ message: 'Không thể xóa danh sách phát', error: error.message });
  }
});

// GET /api/artists/:id - Chi tiết nghệ sĩ cho thư viện
playlistRouter.get('/artists/:id', async (req: Request, res: Response) => {
  try {
    const artistId = Number(req.params.id);
    if (!artistId || !Number.isFinite(artistId)) {
      return res.status(400).json({ message: 'ID nghệ sĩ không hợp lệ.' });
    }

    const [artistRows]: [any[], any] = await db.query(
      `SELECT artist_id, name, bio, avatar_url, banner_clicks, created_at FROM artists WHERE artist_id = ?`,
      [artistId]
    );

    if (!artistRows.length) {
      return res.status(404).json({ message: 'Không tìm thấy nghệ sĩ.' });
    }

    const artist = artistRows[0];

    const [songs]: [any[], any] = await db.query(
      `
      SELECT
        s.song_id,
        s.title,
        s.duration,
        s.audio_url,
        s.cover_url,
        a.name AS artist_name,
        s.created_at AS added_at
      FROM songs s
      LEFT JOIN artists a ON a.artist_id = s.artist_id
      WHERE s.artist_id = ?
      ORDER BY s.play_count DESC, s.created_at DESC
    `,
      [artistId]
    );

    return res.json({
      artist,
      songs,
    });
  } catch (error: any) {
    console.error('Lỗi GET /artists/:id:', error);
    return res.status(500).json({ message: 'Lỗi tải chi tiết nghệ sĩ', error: error.message });
  }
});
