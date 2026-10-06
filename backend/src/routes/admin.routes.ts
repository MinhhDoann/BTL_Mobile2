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
      message: 'Đăng bài thành công. Đây là phần mềm trung gian, người đăng tự chịu trách nhiệm bản quyền',
      song: createdSong[0],
    });
  } catch (error: any) {
    console.error('Lỗi tạo bài hát admin:', error);
    return res.status(500).json({ message: 'Không thể đăng bài hát', error: error.message });
  }
});

// GET /api/admin/complaints - Lấy danh sách khiếu nại
adminRouter.get('/complaints', async (_req: Request, res: Response) => {
  try {
    const [rows]: [any[], any] = await db.query(`
      SELECT 
        c.complaint_id,
        c.reason_type,
        c.description,
        c.status,
        c.created_at,
        s.song_id,
        s.title AS song_title,
        s.cover_url AS song_cover,
        s.duration AS song_duration,
        s.audio_url AS song_audio,
        a.artist_id,
        a.name AS artist_name,
        a.avatar_url AS artist_avatar,
        a.bio AS artist_bio,
        u.user_id AS complainant_id,
        u.username AS complainant_name,
        u.email AS complainant_email
      FROM complaints c
      JOIN songs s ON c.song_id = s.song_id
      LEFT JOIN artists a ON s.artist_id = a.artist_id
      JOIN users u ON c.user_id = u.user_id
      ORDER BY c.created_at DESC
    `);

    return res.json({ complaints: rows });
  } catch (error: any) {
    console.error('Lỗi lấy danh sách khiếu nại:', error);
    return res.status(500).json({ message: 'Không thể lấy danh sách khiếu nại', error: error.message });
  }
});

// PUT /api/admin/complaints/:id/status - Tiếp nhận hoặc Từ chối khiếu nại
adminRouter.put('/complaints/:id/status', async (req: Request, res: Response) => {
  try {
    const complaintId = Number(req.params.id);
    const { status } = req.body ?? {};

    if (!complaintId || !Number.isFinite(complaintId)) {
      return res.status(400).json({ message: 'ID khiếu nại không hợp lệ.' });
    }

    if (!['accepted', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ.' });
    }

    const [result]: [any, any] = await db.query(
      `UPDATE complaints SET status = ? WHERE complaint_id = ?`,
      [status, complaintId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy khiếu nại.' });
    }

    return res.json({
      ok: true,
      message: status === 'accepted' ? 'Đã tiếp nhận khiếu nại thành công.' : 'Đã từ chối khiếu nại.',
    });
  } catch (error: any) {
    console.error('Lỗi cập nhật trạng thái khiếu nại:', error);
    return res.status(500).json({ message: 'Không thể cập nhật trạng thái khiếu nại', error: error.message });
  }
});

// GET /api/admin/revenue/report - Báo cáo thống kê doanh thu toàn hệ thống
adminRouter.get('/revenue/report', async (_req: Request, res: Response) => {
  try {
    const [statsRows]: [any[], any] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM artists) AS total_artists,
        (SELECT COUNT(*) FROM songs) AS total_songs,
        (SELECT COALESCE(SUM(play_count), 0) FROM songs) AS total_plays,
        (SELECT COALESCE(SUM(banner_clicks), 0) FROM artists) AS total_banner_clicks
    `);

    const stats = statsRows[0] || { total_users: 0, total_artists: 0, total_songs: 0, total_plays: 0, total_banner_clicks: 0 };
    const totalPlays = Number(stats.total_plays) || 0;
    const totalBannerClicks = Number(stats.total_banner_clicks) || 0;

    const songPlayRevenue = totalPlays * 100;
    const adBannerRevenue = totalBannerClicks * 3000;
    const grossSystemRevenue = songPlayRevenue + adBannerRevenue;

    const platformAdShare = adBannerRevenue * 0.30;
    const artistAdShareGross = adBannerRevenue * 0.70;
    const pitTaxWithheld = artistAdShareGross * 0.10;
    const artistAdShareNet = artistAdShareGross - pitTaxWithheld;

    const totalArtistNetEarnings = artistAdShareNet + songPlayRevenue;
    const platformNetRevenue = platformAdShare + pitTaxWithheld;

    // Payout stats
    const [payoutRows]: [any[], any] = await db.query(`
      SELECT 
        COUNT(*) AS total_requests,
        COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) AS approved_amount,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) AS pending_amount,
        COALESCE(SUM(CASE WHEN status = 'rejected' THEN amount ELSE 0 END), 0) AS rejected_amount
      FROM payout_requests
    `);
    const payoutSummary = payoutRows[0] || { total_requests: 0, approved_amount: 0, pending_amount: 0, rejected_amount: 0 };

    // Detailed artist revenue list
    const [artistRows]: [any[], any] = await db.query(`
      SELECT 
        a.artist_id,
        a.name AS artist_name,
        a.avatar_url,
        COALESCE(s.total_songs, 0) AS total_songs,
        COALESCE(s.total_plays, 0) AS total_plays,
        COALESCE(a.banner_clicks, 0) AS banner_clicks,
        COALESCE(p.total_withdrawn, 0) AS total_withdrawn
      FROM artists a
      LEFT JOIN (
        SELECT artist_id, COUNT(song_id) AS total_songs, COALESCE(SUM(play_count), 0) AS total_plays
        FROM songs
        GROUP BY artist_id
      ) s ON s.artist_id = a.artist_id
      LEFT JOIN (
        SELECT artist_id, COALESCE(SUM(amount), 0) AS total_withdrawn
        FROM payout_requests
        WHERE status != 'rejected'
        GROUP BY artist_id
      ) p ON p.artist_id = a.artist_id
      ORDER BY s.total_plays DESC, a.banner_clicks DESC
    `);

    const artistBreakdown = artistRows.map((art: any) => {
      const plays = Number(art.total_plays) || 0;
      const clicks = Number(art.banner_clicks) || 0;
      const withdrawn = Number(art.total_withdrawn) || 0;

      const songRev = plays * 100;
      const adGross = clicks * 3000;
      const artistAdShare = adGross * 0.7;
      const pitTax = artistAdShare * 0.1;
      const artistNet = (artistAdShare - pitTax) + songRev;
      const availableBalance = Math.max(0, artistNet - withdrawn);

      return {
        artist_id: art.artist_id,
        artist_name: art.artist_name,
        avatar_url: art.avatar_url,
        total_songs: Number(art.total_songs) || 0,
        total_plays: plays,
        banner_clicks: clicks,
        song_revenue: songRev,
        ad_gross_revenue: adGross,
        artist_ad_share: artistAdShare,
        pit_tax: pitTax,
        artist_net: artistNet,
        total_withdrawn: withdrawn,
        available_balance: availableBalance,
      };
    });

    // Top songs revenue
    const [topSongRows]: [any[], any] = await db.query(`
      SELECT 
        s.song_id,
        s.title,
        s.cover_url,
        s.play_count,
        (s.play_count * 100) AS song_revenue,
        a.name AS artist_name
      FROM songs s
      LEFT JOIN artists a ON a.artist_id = s.artist_id
      ORDER BY s.play_count DESC, s.song_id DESC
      LIMIT 10
    `);

    return res.json({
      summary: {
        total_users: Number(stats.total_users) || 0,
        total_artists: Number(stats.total_artists) || 0,
        total_songs: Number(stats.total_songs) || 0,
        total_plays: totalPlays,
        total_banner_clicks: totalBannerClicks,
        song_play_revenue: songPlayRevenue,
        ad_banner_revenue: adBannerRevenue,
        gross_system_revenue: grossSystemRevenue,
        platform_ad_share: platformAdShare,
        artist_ad_share_gross: artistAdShareGross,
        pit_tax_withheld: pitTaxWithheld,
        artist_ad_share_net: artistAdShareNet,
        total_artist_net_earnings: totalArtistNetEarnings,
        platform_net_revenue: platformNetRevenue,
      },
      payout_summary: {
        total_requests: Number(payoutSummary.total_requests) || 0,
        approved_amount: Number(payoutSummary.approved_amount) || 0,
        pending_amount: Number(payoutSummary.pending_amount) || 0,
        rejected_amount: Number(payoutSummary.rejected_amount) || 0,
      },
      artist_breakdown: artistBreakdown,
      top_songs: topSongRows.map((song: any) => ({
        song_id: song.song_id,
        title: song.title,
        cover_url: song.cover_url,
        play_count: Number(song.play_count) || 0,
        song_revenue: Number(song.song_revenue) || 0,
        artist_name: song.artist_name || 'Nghệ sĩ chưa rõ',
      })),
    });
  } catch (error: any) {
    console.error('Lỗi lấy báo cáo doanh thu admin:', error);
    return res.status(500).json({ message: 'Không thể tải báo cáo doanh thu quản trị', error: error.message });
  }
});


