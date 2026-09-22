import { Router, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth.types';

export const RATE_PER_PLAY = 100; // 100 VNĐ cho mỗi lượt nghe / view

export function createArtistRouter(db: any): Router {
  const router = Router();

  // Helper để lấy hoặc tự động khởi tạo hồ sơ Nghệ sĩ liên kết với user
  async function getOrCreateArtist(user: { user_id: number; username: string; avatar_url?: string | null }) {
    const [existing]: [any[], any] = await db.query(
      'SELECT artist_id, name, bio, avatar_url, user_id, created_at FROM artists WHERE user_id = ? LIMIT 1',
      [user.user_id]
    );

    if (existing && existing.length > 0) {
      return existing[0];
    }

    // Nếu chưa có, tạo hồ sơ mới dựa trên username và avatar
    const name = user.username || `Nghệ sĩ #${user.user_id}`;
    const avatar = user.avatar_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400';
    const [result]: [any, any] = await db.query(
      'INSERT INTO artists (name, bio, avatar_url, user_id) VALUES (?, ?, ?, ?)',
      [name, 'Chưa có tiểu sử.', avatar, user.user_id]
    );

    return {
      artist_id: result.insertId,
      name,
      bio: 'Chưa có tiểu sử.',
      avatar_url: avatar,
      user_id: user.user_id,
      created_at: new Date(),
    };
  }

  // Route công khai cho người dùng đăng nhập để nâng cấp lên Nghệ sĩ
  router.post('/register', async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập để nâng cấp tài khoản.' });
    }

    try {
      await db.query('UPDATE users SET role = "artist" WHERE user_id = ?', [req.user.user_id]);
      req.user.role = 'artist';

      const artist = await getOrCreateArtist(req.user);
      return res.json({
        message: 'Chúc mừng bạn đã trở thành Nghệ sĩ!',
        user: req.user,
        artist,
      });
    } catch (error: any) {
      console.error('Lỗi nâng cấp nghệ sĩ:', error);
      return res.status(500).json({ message: 'Không thể nâng cấp tài khoản lúc này.', error: error.message });
    }
  });

  // Middleware bảo vệ: Yêu cầu quyền Artist hoặc Admin
  router.use((req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Vui lòng đăng nhập.' });
    }
    if (req.user.role !== 'artist' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Chỉ tài khoản Nghệ sĩ mới có quyền truy cập Studio.' });
    }
    res.set('Cache-Control', 'no-store');
    next();
  });

  // 1. GET /api/artist/profile
  router.get('/profile', async (req: AuthRequest, res: Response) => {
    try {
      const artist = await getOrCreateArtist(req.user!);
      return res.json({ artist });
    } catch (error: any) {
      console.error('Lỗi lấy profile nghệ sĩ:', error);
      return res.status(500).json({ message: 'Lỗi máy chủ khi lấy thông tin nghệ sĩ.' });
    }
  });

  // 2. PUT /api/artist/profile
  router.put('/profile', async (req: AuthRequest, res: Response) => {
    try {
      const artist = await getOrCreateArtist(req.user!);
      const { name, bio, avatar_url } = req.body || {};

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ message: 'Tên nghệ sĩ không được để trống.' });
      }

      await db.query(
        'UPDATE artists SET name = ?, bio = ?, avatar_url = ? WHERE artist_id = ?',
        [name.trim(), typeof bio === 'string' ? bio.trim() : artist.bio, typeof avatar_url === 'string' ? avatar_url.trim() : artist.avatar_url, artist.artist_id]
      );

      const updated = {
        ...artist,
        name: name.trim(),
        bio: typeof bio === 'string' ? bio.trim() : artist.bio,
        avatar_url: typeof avatar_url === 'string' ? avatar_url.trim() : artist.avatar_url,
      };

      return res.json({ message: 'Cập nhật thông tin thành công!', artist: updated });
    } catch (error: any) {
      console.error('Lỗi cập nhật profile nghệ sĩ:', error);
      return res.status(500).json({ message: 'Không thể cập nhật thông tin nghệ sĩ.' });
    }
  });

  // 3. GET /api/artist/songs - Danh sách bài hát do nghệ sĩ này phát hành
  router.get('/songs', async (req: AuthRequest, res: Response) => {
    try {
      const artist = await getOrCreateArtist(req.user!);
      const [rows]: [any[], any] = await db.query(
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
          al.title AS album_title,
          GROUP_CONCAT(g.name SEPARATOR ', ') AS genres
        FROM songs s
        LEFT JOIN albums al ON al.album_id = s.album_id
        LEFT JOIN song_genres sg ON sg.song_id = s.song_id
        LEFT JOIN genres g ON g.genre_id = sg.genre_id
        WHERE s.artist_id = ?
        GROUP BY s.song_id
        ORDER BY s.song_id DESC
        `,
        [artist.artist_id]
      );

      const songsWithRevenue = rows.map((song) => ({
        ...song,
        revenue: (Number(song.play_count) || 0) * RATE_PER_PLAY,
      }));

      return res.json({
        artist,
        songs: songsWithRevenue,
        total: songsWithRevenue.length,
      });
    } catch (error: any) {
      console.error('Lỗi tải bài hát nghệ sĩ:', error);
      return res.status(500).json({ message: 'Không thể tải danh sách bài hát.' });
    }
  });

  // 4. POST /api/artist/songs - Nghệ sĩ đăng tải bài hát mới
  router.post('/songs', async (req: AuthRequest, res: Response) => {
    try {
      const artist = await getOrCreateArtist(req.user!);
      const { title, duration, audio_url, cover_url, lyrics, genres, album_id } = req.body || {};

      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ message: 'Vui lòng nhập tiêu đề bài hát.' });
      }

      if (!audio_url || typeof audio_url !== 'string' || !audio_url.trim()) {
        return res.status(400).json({ message: 'Vui lòng nhập đường dẫn file âm thanh (audio URL).' });
      }

      const songDuration = Number(duration) > 0 ? Number(duration) : 180;
      const cleanCoverUrl = typeof cover_url === 'string' && cover_url.trim() ? cover_url.trim() : null;
      const cleanLyrics = typeof lyrics === 'string' ? lyrics.trim() : null;
      const cleanAlbumId = Number(album_id) > 0 ? Number(album_id) : null;

      const [result]: [any, any] = await db.query(
        `
        INSERT INTO songs (title, duration, audio_url, cover_url, lyrics, play_count, artist_id, album_id)
        VALUES (?, ?, ?, ?, ?, 0, ?, ?)
        `,
        [title.trim(), songDuration, audio_url.trim(), cleanCoverUrl, cleanLyrics, artist.artist_id, cleanAlbumId]
      );

      const songId = result.insertId;

      // Thêm thể loại nếu có
      if (Array.isArray(genres) && genres.length > 0) {
        const genreInserts = genres
          .map((id) => Number(id))
          .filter((id) => Number.isFinite(id) && id > 0)
          .map((id) => [songId, id]);

        if (genreInserts.length > 0) {
          await db.query('INSERT INTO song_genres (song_id, genre_id) VALUES ?', [genreInserts]);
        }
      }

      return res.status(201).json({
        ok: true,
        message: 'Đăng bài hát thành công!',
        songId,
      });
    } catch (error: any) {
      console.error('Lỗi đăng bài hát:', error);
      return res.status(500).json({ message: 'Không thể lưu bài hát.', error: error.message });
    }
  });

  // 5. DELETE /api/artist/songs/:songId - Xóa bài hát thuộc về nghệ sĩ này
  router.delete('/songs/:songId', async (req: AuthRequest, res: Response) => {
    try {
      const artist = await getOrCreateArtist(req.user!);
      const songId = Number(req.params.songId);

      if (!songId || !Number.isFinite(songId)) {
        return res.status(400).json({ message: 'songId không hợp lệ.' });
      }

      // Kiểm tra bài hát có thuộc nghệ sĩ này không
      const [existing]: [any[], any] = await db.query(
        'SELECT song_id, artist_id FROM songs WHERE song_id = ?',
        [songId]
      );

      if (!existing.length) {
        return res.status(404).json({ message: 'Không tìm thấy bài hát.' });
      }

      if (req.user?.role !== 'admin' && existing[0].artist_id !== artist.artist_id) {
        return res.status(403).json({ message: 'Bạn không có quyền xóa bài hát của nghệ sĩ khác.' });
      }

      await db.query('DELETE FROM songs WHERE song_id = ?', [songId]);

      return res.json({ ok: true, message: 'Đã xóa bài hát thành công.' });
    } catch (error: any) {
      console.error('Lỗi xóa bài hát:', error);
      return res.status(500).json({ message: 'Không thể xóa bài hát.' });
    }
  });

  // 6. GET /api/artist/revenue - Doanh thu theo lượt view/nghe
  router.get('/revenue', async (req: AuthRequest, res: Response) => {
    try {
      const artist = await getOrCreateArtist(req.user!);

      const [summary]: [any[], any] = await db.query(
        `
        SELECT 
          COUNT(song_id) AS total_songs,
          COALESCE(SUM(play_count), 0) AS total_plays
        FROM songs
        WHERE artist_id = ?
        `,
        [artist.artist_id]
      );

      const totalSongs = Number(summary[0]?.total_songs) || 0;
      const totalPlays = Number(summary[0]?.total_plays) || 0;
      const totalRevenue = totalPlays * RATE_PER_PLAY;

      const [songRows]: [any[], any] = await db.query(
        `
        SELECT 
          song_id,
          title,
          cover_url,
          play_count,
          (play_count * ?) AS song_revenue,
          DATE_FORMAT(created_at, '%d/%m/%Y') AS created_date
        FROM songs
        WHERE artist_id = ?
        ORDER BY play_count DESC, song_id DESC
        `,
        [RATE_PER_PLAY, artist.artist_id]
      );

      return res.json({
        artist: {
          artist_id: artist.artist_id,
          name: artist.name,
          avatar_url: artist.avatar_url,
        },
        rate_per_play: RATE_PER_PLAY,
        currency: 'VNĐ',
        total_songs: totalSongs,
        total_plays: totalPlays,
        total_revenue: totalRevenue,
        withdrawable_balance: totalRevenue,
        song_breakdown: songRows,
      });
    } catch (error: any) {
      console.error('Lỗi tính doanh thu:', error);
      return res.status(500).json({ message: 'Không thể tải báo cáo doanh thu.' });
    }
  });

  // 7. POST /api/artist/payout-request - Gửi yêu cầu rút tiền / thanh toán
  router.post('/payout-request', async (req: AuthRequest, res: Response) => {
    try {
      const artist = await getOrCreateArtist(req.user!);
      const { amount, bank_name, account_number, account_holder } = req.body || {};

      const payoutAmount = Number(amount);
      if (!payoutAmount || payoutAmount <= 0) {
        return res.status(400).json({ message: 'Số tiền rút không hợp lệ.' });
      }

      if (!bank_name || !account_number || !account_holder) {
        return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin ngân hàng thụ hưởng.' });
      }

      // Kiểm tra số dư doanh thu
      const [summary]: [any[], any] = await db.query(
        'SELECT COALESCE(SUM(play_count), 0) * ? AS total_revenue FROM songs WHERE artist_id = ?',
        [RATE_PER_PLAY, artist.artist_id]
      );

      const totalRevenue = Number(summary[0]?.total_revenue) || 0;
      if (payoutAmount > totalRevenue) {
        return res.status(400).json({
          message: `Số tiền yêu cầu (${payoutAmount.toLocaleString()} VNĐ) vượt quá tổng doanh thu khả dụng (${totalRevenue.toLocaleString()} VNĐ).`,
        });
      }

      return res.json({
        ok: true,
        message: `Yêu cầu rút ${payoutAmount.toLocaleString()} VNĐ về tài khoản ${account_number} (${bank_name}) đã được tiếp nhận. Tiền sẽ về trong 24 giờ làm việc.`,
        payout: {
          amount: payoutAmount,
          bank_name,
          account_number,
          account_holder,
          requested_at: new Date().toISOString(),
          status: 'pending',
        },
      });
    } catch (error: any) {
      console.error('Lỗi yêu cầu rút tiền:', error);
      return res.status(500).json({ message: 'Không thể thực hiện yêu cầu rút tiền lúc này.' });
    }
  });

  return router;
}
