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
