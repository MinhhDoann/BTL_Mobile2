import { Router, Request, Response } from 'express';
import { db } from '../config/db';

export const adminRouter = Router();

// GET /api/admin/dashboard
adminRouter.get('/dashboard', async (_req: Request, res: Response) => {
  try {
    const [statsRows]: [any[], any] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS users_count,
        (SELECT COUNT(*) FROM artists) AS artists_count,
        (SELECT COUNT(*) FROM songs) AS songs_count,
        (SELECT COUNT(*) FROM playlists) AS playlists_count,
        (SELECT COALESCE(SUM(play_count), 0) FROM songs) AS total_plays
    `);

    const [artistsRows]: [any[], any] = await db.query(`
      SELECT artist_id, name, avatar_url
      FROM artists
      ORDER BY name ASC
    `);

    const [albumsRows]: [any[], any] = await db.query(`
      SELECT album_id, title, artist_id, cover_url, release_date
      FROM albums
      ORDER BY title ASC
    `);

    const [genresRows]: [any[], any] = await db.query(`
      SELECT genre_id, name
      FROM genres
      ORDER BY name ASC
    `);

    const [recentRows]: [any[], any] = await db.query(`
      SELECT
        s.song_id,
        s.title,
        s.cover_url,
        s.created_at,
        a.name AS artist_name,
        GROUP_CONCAT(DISTINCT g.name ORDER BY g.name SEPARATOR ', ') AS genres
      FROM songs s
      LEFT JOIN artists a ON a.artist_id = s.artist_id
      LEFT JOIN song_genres sg ON sg.song_id = s.song_id
      LEFT JOIN genres g ON g.genre_id = sg.genre_id
      GROUP BY s.song_id, s.title, s.cover_url, s.created_at, a.name
      ORDER BY s.created_at DESC
      LIMIT 8
    `);

    return res.json({
      stats: statsRows[0] ?? { users_count: 0, artists_count: 0, songs_count: 0, playlists_count: 0, total_plays: 0 },
      artists: artistsRows,
      albums: albumsRows,
      genres: genresRows,
      recentSongs: recentRows,
    });
  } catch (error: any) {
    console.error('Lỗi dashboard admin:', error);
    return res.status(500).json({ message: 'Không thể tải dữ liệu quản trị', error: error.message });
  }
});

// POST /api/admin/artists
adminRouter.post('/artists', async (req: Request, res: Response) => {
  try {
    const { name, bio, avatar_url } = req.body ?? {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Tên nghệ sĩ không được để trống.' });
    }

    const [result]: [any, any] = await db.query(
      `INSERT INTO artists (name, bio, avatar_url) VALUES (?, ?, ?)`,
      [String(name).trim(), bio ? String(bio).trim() : null, avatar_url ? String(avatar_url).trim() : null]
    );

    const [artist]: [any[], any] = await db.query('SELECT * FROM artists WHERE artist_id = ?', [result.insertId]);

    return res.status(201).json({ message: 'Thêm nghệ sĩ thành công.', artist: artist[0] });
  } catch (error: any) {
    console.error('Lỗi tạo nghệ sĩ:', error);
    return res.status(500).json({ message: 'Không thể thêm nghệ sĩ', error: error.message });
  }
});

// POST /api/admin/albums
adminRouter.post('/albums', async (req: Request, res: Response) => {
  try {
    const { title, artist_id, cover_url, release_date } = req.body ?? {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Tên album không được để trống.' });
    }

    if (!artist_id) {
      return res.status(400).json({ message: 'Vui lòng chọn nghệ sĩ cho album.' });
    }

    const normalizedArtistId = Number(artist_id);
    const [artistCheck]: [any[], any] = await db.query('SELECT artist_id FROM artists WHERE artist_id = ?', [normalizedArtistId]);

    if (!artistCheck.length) {
      return res.status(400).json({ message: 'Nghệ sĩ không tồn tại.' });
    }

    const [result]: [any, any] = await db.query(
      `INSERT INTO albums (title, cover_url, release_date, artist_id) VALUES (?, ?, ?, ?)`,
      [String(title).trim(), cover_url ? String(cover_url).trim() : null, release_date || null, normalizedArtistId]
    );

    const [album]: [any[], any] = await db.query('SELECT * FROM albums WHERE album_id = ?', [result.insertId]);

    return res.status(201).json({ message: 'Thêm album thành công.', album: album[0] });
  } catch (error: any) {
    console.error('Lỗi tạo album:', error);
    return res.status(500).json({ message: 'Không thể thêm album', error: error.message });
  }
});

// POST /api/admin/genres
adminRouter.post('/genres', async (req: Request, res: Response) => {
  try {
    const { name } = req.body ?? {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Tên thể loại không được để trống.' });
    }

    const cleanName = String(name).trim();
    const [exists]: [any[], any] = await db.query('SELECT genre_id FROM genres WHERE LOWER(name) = LOWER(?)', [cleanName]);

    if (exists.length) {
      return res.status(400).json({ message: 'Thể loại này đã tồn tại.' });
    }

    const [result]: [any, any] = await db.query('INSERT INTO genres (name) VALUES (?)', [cleanName]);
    const [genre]: [any[], any] = await db.query('SELECT * FROM genres WHERE genre_id = ?', [result.insertId]);

    return res.status(201).json({ message: 'Thêm thể loại thành công.', genre: genre[0] });
  } catch (error: any) {
    console.error('Lỗi tạo thể loại:', error);
    return res.status(500).json({ message: 'Không thể thêm thể loại', error: error.message });
  }
});

// POST /api/admin/songs
adminRouter.post('/songs', async (req: Request, res: Response) => {
  try {
    const {
      title,
      artist_id,
      album_id,
      duration,
      audio_url,
      cover_url,
      lyrics,
      genres = [],
    } = req.body ?? {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Tên bài hát không được để trống.' });
    }

    if (!artist_id) {
      return res.status(400).json({ message: 'Vui lòng chọn nghệ sĩ.' });
    }

    if (!duration || Number(duration) <= 0) {
      return res.status(400).json({ message: 'Thời lượng phải lớn hơn 0 giây.' });
    }

    if (!audio_url || !String(audio_url).trim()) {
      return res.status(400).json({ message: 'Audio URL không được để trống.' });
    }

    const normalizedArtistId = Number(artist_id);
    const normalizedAlbumId = album_id ? Number(album_id) : null;
    const normalizedDuration = Number(duration);
    let uniqueGenres = Array.from(
      new Set((genres ?? []).map((g: any) => Number(g)).filter((g: any) => Number.isFinite(g) && g > 0))
    ) as number[];

    const [artistCheck]: [any[], any] = await db.query('SELECT artist_id FROM artists WHERE artist_id = ?', [normalizedArtistId]);
    if (!artistCheck.length) {
      return res.status(400).json({ message: 'Nghệ sĩ không tồn tại.' });
    }

    if (normalizedAlbumId) {
      const [albumCheck]: [any[], any] = await db.query('SELECT album_id FROM albums WHERE album_id = ?', [normalizedAlbumId]);
      if (!albumCheck.length) {
        return res.status(400).json({ message: 'Album không tồn tại.' });
      }
    }

    if (uniqueGenres.length) {
      const [genreRows]: [any[], any] = await db.query(
        `SELECT genre_id FROM genres WHERE genre_id IN (${uniqueGenres.map(() => '?').join(',')})`,
        uniqueGenres
      );
      const validGenreIds = genreRows.map((row: any) => Number(row.genre_id));
      if (validGenreIds.length !== uniqueGenres.length) {
        return res.status(400).json({ message: 'Một hoặc nhiều thể loại không hợp lệ.' });
      }
    } else {
      const [defaultGenreRows]: [any[], any] = await db.query(
        'SELECT genre_id FROM genres WHERE LOWER(name) = LOWER(?)',
        ['Khác']
      );

      if (defaultGenreRows.length) {
        uniqueGenres = [Number(defaultGenreRows[0].genre_id)];
      } else {
        const [insertDefaultGenre]: [any, any] = await db.query('INSERT INTO genres (name) VALUES (?)', ['Khác']);
        uniqueGenres = [Number(insertDefaultGenre.insertId)];
      }
    }

    const [result]: [any, any] = await db.query(
      `INSERT INTO songs (title, duration, audio_url, cover_url, lyrics, artist_id, album_id, play_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        String(title).trim(),
        normalizedDuration,
        String(audio_url).trim(),
        cover_url ? String(cover_url).trim() : null,
        lyrics ? String(lyrics).trim() : null,
        normalizedArtistId,
        normalizedAlbumId,
      ]
    );

    const songId = result.insertId;

    if (uniqueGenres.length) {
      const values = uniqueGenres.map((genreId) => [songId, genreId]);
      await db.query(`INSERT INTO song_genres (song_id, genre_id) VALUES ?`, [values]);
    }

    const [createdSong]: [any[], any] = await db.query(
      `SELECT s.*, a.name AS artist_name
       FROM songs s
       LEFT JOIN artists a ON a.artist_id = s.artist_id
       WHERE s.song_id = ?`,
      [songId]
    );

    return res.status(201).json({
      message: 'Đăng bài thành công.',
      song: createdSong[0],
    });
  } catch (error: any) {
    console.error('Lỗi tạo bài hát admin:', error);
    return res.status(500).json({ message: 'Không thể đăng bài hát', error: error.message });
  }
});
