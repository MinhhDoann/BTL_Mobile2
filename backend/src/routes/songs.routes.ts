import { Router, Request, Response } from 'express';
import { db } from '../config/db';

export const songsRouter = Router();

// GET /api/songs/:songId/detail
songsRouter.get('/:songId/detail', async (req: Request, res: Response) => {
  try {
    const songId = Number(req.params.songId);

    if (!songId || !Number.isFinite(songId)) {
      return res.status(400).json({ message: 'songId không hợp lệ.' });
    }

    const [songRows]: [any[], any] = await db.query(
      `
      SELECT
        s.song_id,
        s.title,
        s.duration,
        s.audio_url,
        s.cover_url,
        s.lyrics,
        s.play_count,
        s.created_at,
        a.artist_id,
        a.name AS artist_name,
        a.avatar_url AS artist_avatar,
        COALESCE(g.name, 'Khác') AS genre_name
      FROM songs s
      LEFT JOIN artists a ON a.artist_id = s.artist_id
      LEFT JOIN song_genres sg ON sg.song_id = s.song_id
      LEFT JOIN genres g ON g.genre_id = sg.genre_id
      WHERE s.song_id = ?
      GROUP BY s.song_id, s.title, s.duration, s.audio_url, s.cover_url, s.lyrics, s.play_count, s.created_at,
               a.artist_id, a.name, a.avatar_url, g.name
      LIMIT 1
    `,
      [songId]
    );

    if (!songRows.length) {
      return res.status(404).json({ message: 'Không tìm thấy bài hát.' });
    }

    const song = songRows[0];

    const [artistSongs]: [any[], any] = await db.query(
      `
      SELECT
        s.song_id,
        s.title,
        s.cover_url,
        s.audio_url,
        a.name AS artist_name
      FROM songs s
      LEFT JOIN artists a ON a.artist_id = s.artist_id
      WHERE s.artist_id = ? AND s.song_id <> ?
      ORDER BY s.created_at DESC
      LIMIT 5
    `,
      [song.artist_id, songId]
    );

    const [genreSongs]: [any[], any] = await db.query(
      `
      SELECT
        s.song_id,
        s.title,
        s.cover_url,
        s.audio_url,
        a.name AS artist_name
      FROM songs s
      LEFT JOIN artists a ON a.artist_id = s.artist_id
      LEFT JOIN song_genres sg ON sg.song_id = s.song_id
      LEFT JOIN genres g ON g.genre_id = sg.genre_id
      WHERE g.name = ? AND s.song_id <> ?
      GROUP BY s.song_id, s.title, s.cover_url, s.audio_url, a.name
      ORDER BY s.play_count DESC, s.created_at DESC
      LIMIT 5
    `,
      [song.genre_name || 'Khác', songId]
    );

    return res.json({
      song,
      relatedByArtist: artistSongs,
      relatedByGenre: genreSongs,
    });
  } catch (error: any) {
    console.error('Lỗi lấy chi tiết bài hát:', error);
    return res.status(500).json({ message: 'Không thể tải chi tiết bài hát', error: error.message });
  }
});

// POST /api/songs/:songId/listen - Ghi nhận 1 lượt nghe (view/stream)
songsRouter.post('/:songId/listen', async (req: Request, res: Response) => {
  try {
    const songId = Number(req.params.songId);
    if (!songId || !Number.isFinite(songId)) {
      return res.status(400).json({ message: 'songId không hợp lệ.' });
    }

    const userId = Number(req.body?.userId);
    if (userId && Number.isFinite(userId)) {
      // Kiểm tra xem user_id này có phải là chủ sở hữu của bài hát không
      const [artistCheck]: [any[], any] = await db.query(
        `SELECT a.user_id FROM songs s JOIN artists a ON s.artist_id = a.artist_id WHERE s.song_id = ?`,
        [songId]
      );
      
      if (artistCheck.length > 0 && artistCheck[0].user_id === userId) {
        // Trả về số lượt nghe hiện tại mà KHÔNG tăng lên (nghệ sĩ đang tự nghe bài của mình)
        const [rows]: [any[], any] = await db.query('SELECT play_count FROM songs WHERE song_id = ?', [songId]);
        return res.json({ ok: true, play_count: rows[0]?.play_count ?? 0, ignored: true });
      }

      await db.query('INSERT INTO listening_history (user_id, song_id) VALUES (?, ?)', [userId, songId]).catch(() => {});
    }

    // Tăng play_count nếu không bị loại trừ
    await db.query('UPDATE songs SET play_count = play_count + 1 WHERE song_id = ?', [songId]);

    const [rows]: [any[], any] = await db.query('SELECT play_count FROM songs WHERE song_id = ?', [songId]);

    return res.json({ ok: true, play_count: rows[0]?.play_count ?? 0 });
  } catch (error: any) {
    console.error('Lỗi ghi nhận lượt nghe:', error);
    return res.status(500).json({ message: 'Không thể ghi nhận lượt nghe', error: error.message });
  }
});

export async function ensureComplaintsTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        complaint_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        song_id INT NOT NULL,
        reason_type VARCHAR(50) NOT NULL DEFAULT 'Bản quyền',
        description TEXT NULL,
        status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (song_id) REFERENCES songs(song_id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (e) {
    console.error('Error creating complaints table:', e);
  }
}

// POST /api/songs/:songId/complaint - Gửi khiếu nại bài hát
songsRouter.post('/:songId/complaint', async (req: Request, res: Response) => {
  try {
    await ensureComplaintsTable();
    const songId = Number(req.params.songId);
    if (!songId || !Number.isFinite(songId)) {
      return res.status(400).json({ message: 'songId không hợp lệ.' });
    }

    const { userId, reason_type, description } = req.body ?? {};
    let complainantId = Number(userId || (req as any).user?.user_id);

    if (!complainantId || !Number.isFinite(complainantId)) {
      const [uRows]: [any[], any] = await db.query('SELECT user_id FROM users ORDER BY user_id ASC LIMIT 1');
      complainantId = uRows.length ? uRows[0].user_id : 1;
    }

    const cleanReason = reason_type ? String(reason_type).trim() : 'Bản quyền';
    const cleanDesc = description ? String(description).trim() : null;

    const [songCheck]: [any[], any] = await db.query('SELECT song_id FROM songs WHERE song_id = ?', [songId]);
    if (!songCheck.length) {
      return res.status(404).json({ message: 'Bài hát không tồn tại.' });
    }

    const [result]: [any, any] = await db.query(
      `INSERT INTO complaints (user_id, song_id, reason_type, description, status) VALUES (?, ?, ?, ?, 'pending')`,
      [complainantId, songId, cleanReason, cleanDesc]
    );

    return res.status(201).json({
      ok: true,
      message: 'Gửi khiếu nại thành công.',
      complaint_id: result.insertId,
    });
  } catch (error: any) {
    console.error('Lỗi gửi khiếu nại:', error);
    return res.status(500).json({ message: 'Không thể gửi khiếu nại', error: error.message });
  }
});


