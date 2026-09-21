const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { createAuth } = require('./auth');
const { createAdminDataRouter } = require('./admin-data');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '352001',
  database: 'mobile2',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

const auth = createAuth(db);
app.use('/api/auth', auth.router);
app.use('/api/admin', auth.requireAdmin);
app.use('/api/admin/data', createAdminDataRouter(db));

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

    const genresMap = {};
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
  } catch (error) {
    console.error('LỖI SQL:', error);
    return res.status(500).json({
      error: 'Lỗi máy chủ',
      details: error.message,
    });
  }
});

app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const [statsRows] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS users_count,
        (SELECT COUNT(*) FROM artists) AS artists_count,
        (SELECT COUNT(*) FROM songs) AS songs_count,
        (SELECT COUNT(*) FROM playlists) AS playlists_count,
        (SELECT COALESCE(SUM(play_count), 0) FROM songs) AS total_plays
    `);

    const [artistsRows] = await db.query(`
      SELECT artist_id, name, avatar_url
      FROM artists
      ORDER BY name ASC
    `);

    const [albumsRows] = await db.query(`
      SELECT album_id, title, artist_id, cover_url, release_date
      FROM albums
      ORDER BY title ASC
    `);

    const [genresRows] = await db.query(`
      SELECT genre_id, name
      FROM genres
      ORDER BY name ASC
    `);

    const [recentRows] = await db.query(`
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

    res.json({
      stats: statsRows[0] ?? { users_count: 0, artists_count: 0, songs_count: 0, playlists_count: 0, total_plays: 0 },
      artists: artistsRows,
      albums: albumsRows,
      genres: genresRows,
      recentSongs: recentRows,
    });
  } catch (error) {
    console.error('Lỗi dashboard admin:', error);
    res.status(500).json({ message: 'Không thể tải dữ liệu quản trị', error: error.message });
  }
});

app.post('/api/admin/artists', async (req, res) => {
  try {
    const { name, bio, avatar_url } = req.body ?? {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Tên nghệ sĩ không được để trống.' });
    }

    const [result] = await db.query(
      `INSERT INTO artists (name, bio, avatar_url) VALUES (?, ?, ?)` ,
      [String(name).trim(), bio ? String(bio).trim() : null, avatar_url ? String(avatar_url).trim() : null]
    );

    const [artist] = await db.query('SELECT * FROM artists WHERE artist_id = ?', [result.insertId]);

    res.status(201).json({ message: 'Thêm nghệ sĩ thành công.', artist: artist[0] });
  } catch (error) {
    console.error('Lỗi tạo nghệ sĩ:', error);
    res.status(500).json({ message: 'Không thể thêm nghệ sĩ', error: error.message });
  }
});

app.post('/api/admin/albums', async (req, res) => {
  try {
    const { title, artist_id, cover_url, release_date } = req.body ?? {};

    if (!title || !String(title).trim()) {
      return res.status(400).json({ message: 'Tên album không được để trống.' });
    }

    if (!artist_id) {
      return res.status(400).json({ message: 'Vui lòng chọn nghệ sĩ cho album.' });
    }

    const normalizedArtistId = Number(artist_id);
    const [artistCheck] = await db.query('SELECT artist_id FROM artists WHERE artist_id = ?', [normalizedArtistId]);

    if (!artistCheck.length) {
      return res.status(400).json({ message: 'Nghệ sĩ không tồn tại.' });
    }

    const [result] = await db.query(
      `INSERT INTO albums (title, cover_url, release_date, artist_id) VALUES (?, ?, ?, ?)`,
      [String(title).trim(), cover_url ? String(cover_url).trim() : null, release_date || null, normalizedArtistId]
    );

    const [album] = await db.query('SELECT * FROM albums WHERE album_id = ?', [result.insertId]);

    res.status(201).json({ message: 'Thêm album thành công.', album: album[0] });
  } catch (error) {
    console.error('Lỗi tạo album:', error);
    res.status(500).json({ message: 'Không thể thêm album', error: error.message });
  }
});

app.post('/api/admin/genres', async (req, res) => {
  try {
    const { name } = req.body ?? {};

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Tên thể loại không được để trống.' });
    }

    const cleanName = String(name).trim();
    const [exists] = await db.query('SELECT genre_id FROM genres WHERE LOWER(name) = LOWER(?)', [cleanName]);

    if (exists.length) {
      return res.status(400).json({ message: 'Thể loại này đã tồn tại.' });
    }

    const [result] = await db.query('INSERT INTO genres (name) VALUES (?)', [cleanName]);
    const [genre] = await db.query('SELECT * FROM genres WHERE genre_id = ?', [result.insertId]);

    res.status(201).json({ message: 'Thêm thể loại thành công.', genre: genre[0] });
  } catch (error) {
    console.error('Lỗi tạo thể loại:', error);
    res.status(500).json({ message: 'Không thể thêm thể loại', error: error.message });
  }
});

app.get('/api/songs/:songId/detail', async (req, res) => {
  try {
    const songId = Number(req.params.songId);

    if (!songId) {
      return res.status(400).json({ message: 'songId không hợp lệ.' });
    }

    const [songRows] = await db.query(`
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
    `, [songId]);

    if (!songRows.length) {
      return res.status(404).json({ message: 'Không tìm thấy bài hát.' });
    }

    const song = songRows[0];

    const [artistSongs] = await db.query(`
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
    `, [song.artist_id, songId]);

    const [genreSongs] = await db.query(`
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
    `, [song.genre_name || 'Khác', songId]);

    res.json({
      song,
      relatedByArtist: artistSongs,
      relatedByGenre: genreSongs,
    });
  } catch (error) {
    console.error('Lỗi lấy chi tiết bài hát:', error);
    res.status(500).json({ message: 'Không thể tải chi tiết bài hát', error: error.message });
  }
});

app.post('/api/admin/songs', async (req, res) => {
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
    let uniqueGenres = Array.from(new Set((genres ?? []).map((g) => Number(g)).filter((g) => Number.isFinite(g) && g > 0)));

    const [artistCheck] = await db.query('SELECT artist_id FROM artists WHERE artist_id = ?', [normalizedArtistId]);
    if (!artistCheck.length) {
      return res.status(400).json({ message: 'Nghệ sĩ không tồn tại.' });
    }

    if (normalizedAlbumId) {
      const [albumCheck] = await db.query('SELECT album_id FROM albums WHERE album_id = ?', [normalizedAlbumId]);
      if (!albumCheck.length) {
        return res.status(400).json({ message: 'Album không tồn tại.' });
      }
    }

    if (uniqueGenres.length) {
      const [genreRows] = await db.query(
        `SELECT genre_id FROM genres WHERE genre_id IN (${uniqueGenres.map(() => '?').join(',')})`,
        uniqueGenres
      );
      const validGenreIds = genreRows.map((row) => Number(row.genre_id));
      if (validGenreIds.length !== uniqueGenres.length) {
        return res.status(400).json({ message: 'Một hoặc nhiều thể loại không hợp lệ.' });
      }
    } else {
      const [defaultGenreRows] = await db.query('SELECT genre_id FROM genres WHERE LOWER(name) = LOWER(?)', ['Khác']);

      if (defaultGenreRows.length) {
        uniqueGenres = [Number(defaultGenreRows[0].genre_id)];
      } else {
        const [insertDefaultGenre] = await db.query('INSERT INTO genres (name) VALUES (?)', ['Khác']);
        uniqueGenres = [Number(insertDefaultGenre.insertId)];
      }
    }

    const [result] = await db.query(
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
      await db.query(
        `INSERT INTO song_genres (song_id, genre_id) VALUES ?`,
        [values]
      );
    }

    const [createdSong] = await db.query(
      `SELECT s.*, a.name AS artist_name
       FROM songs s
       LEFT JOIN artists a ON a.artist_id = s.artist_id
       WHERE s.song_id = ?`,
      [songId]
    );

    res.status(201).json({
      message: 'Đăng bài thành công.',
      song: createdSong[0],
    });
  } catch (error) {
    console.error('Lỗi tạo bài hát admin:', error);
    res.status(500).json({ message: 'Không thể đăng bài hát', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server API đang chạy tại: http://localhost:${PORT}`);
});


