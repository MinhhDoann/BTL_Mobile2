import { Router, Request, Response } from 'express';
import { db } from '../config/db';
import { GenreWithSongs } from '../types/music.types';

export const homeRouter = Router();

// GET /api/home-data
homeRouter.get('/home-data', async (_req: Request, res: Response) => {
  try {
    const [rows]: [any[], any] = await db.query(`
      SELECT
        COALESCE(g.genre_id, 0) AS genre_id,
        COALESCE(g.name, 'Khác') AS genre_name,
        s.song_id,
        s.title,
        s.cover_url,
        s.audio_url,
        a.name AS artist_name
      FROM songs s
      LEFT JOIN song_genres sg ON sg.song_id = s.song_id
      LEFT JOIN genres g ON g.genre_id = sg.genre_id
      LEFT JOIN artists a ON s.artist_id = a.artist_id
      ORDER BY COALESCE(g.genre_id, 0), s.song_id
    `);

    if (!rows.length) {
      return res.json([]);
    }

    const genresMap: Record<number, GenreWithSongs> = {};
    rows.forEach((row) => {
      const key = Number(row.genre_id) || 0;

      if (!genresMap[key]) {
        genresMap[key] = {
          genre_id: key,
          genre_name: row.genre_name || 'Khác',
          songs: [],
        };
      }

      if (row.song_id) {
        genresMap[key].songs.push({
          song_id: row.song_id,
          title: row.title,
          cover_url: row.cover_url,
          audio_url: row.audio_url,
          artist_name: row.artist_name,
        });
      }
    });

    return res.json(Object.values(genresMap));
  } catch (error: any) {
    console.error('LỖI SQL /home-data:', error);
    return res.status(500).json({
      error: 'Lỗi máy chủ',
      details: error.message,
    });
  }
});
