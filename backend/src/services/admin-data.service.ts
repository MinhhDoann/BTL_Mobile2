import { createHash } from 'node:crypto';
import { EntityConfig, EntityName, DeletionPreviewResult } from '../types/admin.types';

// SQL identifiers and joins come only from this whitelist, never from request input.
export const entities: Record<EntityName, EntityConfig> = {
  users: {
    id: 'user_id',
    label: 'username',
    fields: ['username', 'email', 'avatar_url', 'role', 'is_premium', 'created_at'],
    search: ['t.username', 't.email'],
    joins: '',
    extra: '',
  },
  songs: {
    id: 'song_id',
    label: 'title',
    fields: ['title', 'duration', 'audio_url', 'cover_url', 'lyrics', 'artist_id', 'album_id', 'play_count'],
    search: ['t.title', 'a.name'],
    joins: 'LEFT JOIN artists a ON a.artist_id = t.artist_id LEFT JOIN albums al ON al.album_id = t.album_id',
    extra: ', a.name AS artist_name, al.title AS album_title',
  },
  artists: {
    id: 'artist_id',
    label: 'name',
    fields: ['name', 'bio', 'avatar_url'],
    search: ['t.name'],
    joins: '',
    extra: '',
  },
  albums: {
    id: 'album_id',
    label: 'title',
    fields: ['title', 'cover_url', 'release_date', 'artist_id'],
    search: ['t.title', 'a.name'],
    joins: 'LEFT JOIN artists a ON a.artist_id = t.artist_id',
    extra: ', a.name AS artist_name',
  },
  genres: {
    id: 'genre_id',
    label: 'name',
    fields: ['name'],
    search: ['t.name'],
    joins: '',
    extra: '',
  },
  playlists: {
    id: 'playlist_id',
    label: 'title',
    fields: ['title', 'description', 'cover_url', 'user_id', 'is_public'],
    search: ['t.title', 'u.username'],
    joins: 'LEFT JOIN users u ON u.user_id = t.user_id',
    extra: ', u.username AS owner_name, (SELECT COUNT(*) FROM playlist_songs ps WHERE ps.playlist_id = t.playlist_id) AS song_count',
  },
};

export function fail(status: number, message: string): never {
  const err: any = new Error(message);
  err.status = status;
  throw err;
}

export function selectFields(config: EntityConfig, prefix = ''): string {
  return [config.id, ...config.fields]
    .map((field) =>
      field === 'release_date' ? `DATE_FORMAT(${prefix}${field}, '%Y-%m-%d') AS release_date` : `${prefix}${field}`
    )
    .join(', ');
}

export function integer(value: any, name: string, optional = false): number | null {
  if (optional && (value === '' || value === null || value === undefined)) return null;
  if (
    !['number', 'string'].includes(typeof value) ||
    !/^\d+$/.test(String(value)) ||
    !Number.isSafeInteger(Number(value)) ||
    Number(value) < 1 ||
    Number(value) > 2147483647
  ) {
    fail(400, `${name} phải là số nguyên dương hợp lệ.`);
  }
  return Number(value);
}

export function text(value: any, name: string, max: number, required = false, trim = true): string | null {
  if (value === undefined || value === null || value === '') {
    if (required) fail(400, `Vui lòng nhập ${name}.`);
    return null;
  }
  if (typeof value !== 'string') fail(400, `${name} không hợp lệ.`);
  const result = trim ? value.trim() : value;
  if ((required && !result) || result.length > max) fail(400, `${name} không hợp lệ (tối đa ${max} ký tự).`);
  return result || null;
}

export function boolean(value: any, name: string): number {
  if (![true, false, 0, 1].includes(value)) fail(400, `${name} không hợp lệ.`);
  return value ? 1 : 0;
}

export function normalize(entity: string, body: any, creating: boolean): any {
  if (!body || typeof body !== 'object' || Array.isArray(body)) fail(400, 'Dữ liệu không hợp lệ.');
  const url = (field: string) => text(body[field], field, 255);
  switch (entity) {
    case 'users': {
      const email = text(body.email, 'email', 100, true)!;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'Email không hợp lệ.');
      if (!['user', 'admin', 'artist'].includes(body.role)) fail(400, 'Role phải là user, admin hoặc artist.');
      const data: any = {
        username: text(body.username, 'tên người dùng', 50, true),
        email,
        avatar_url: url('avatar_url'),
        role: body.role,
        is_premium: boolean(body.is_premium, 'Premium'),
      };
      if (creating || (body.password !== '' && body.password !== undefined)) {
        data.password_hash = text(body.password, 'mật khẩu', 255, true, false);
      }
      return data;
    }
    case 'artists':
      return {
        name: text(body.name, 'tên nghệ sĩ', 100, true),
        bio: text(body.bio, 'tiểu sử', 16000),
        avatar_url: url('avatar_url'),
      };
    case 'genres':
      return { name: text(body.name, 'tên thể loại', 50, true) };
    case 'albums': {
      const date = text(body.release_date, 'ngày phát hành', 10);
      if (
        date &&
        (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
          !Number.isFinite(Date.parse(date)) ||
          new Date(date).toISOString().slice(0, 10) !== date)
      ) {
        fail(400, 'Ngày phát hành không hợp lệ.');
      }
      return {
        title: text(body.title, 'tên album', 100, true),
        artist_id: integer(body.artist_id, 'Nghệ sĩ', true),
        cover_url: url('cover_url'),
        release_date: date,
      };
    }
    case 'songs': {
      if (!Array.isArray(body.genres) || body.genres.length > 200) fail(400, 'Danh sách thể loại không hợp lệ.');
      return {
        title: text(body.title, 'tên bài hát', 150, true),
        duration: integer(body.duration, 'Thời lượng'),
        audio_url: text(body.audio_url, 'Audio URL', 255, true),
        cover_url: url('cover_url'),
        lyrics: text(body.lyrics, 'lời bài hát', 16000),
        artist_id: integer(body.artist_id, 'Nghệ sĩ'),
        album_id: integer(body.album_id, 'Album', true),
        genres: [...new Set((body.genres as any[]).map((id) => integer(id, 'Thể loại')))],
      };
    }
    case 'playlists':
      return {
        title: text(body.title, 'tên playlist', 100, true),
        description: text(body.description, 'mô tả', 16000),
        cover_url: url('cover_url'),
        user_id: integer(body.user_id, 'Người sở hữu'),
        is_public: boolean(body.is_public, 'Công khai'),
      };
    default:
      fail(404, 'Mục quản lý không tồn tại.');
  }
}

export async function transaction<T>(db: any, work: (connection: any) => Promise<T>): Promise<T> {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function lockUsers(connection: any, actorId: number): Promise<any[]> {
  // Serialize account edits so concurrent requests cannot remove the last admin.
  const [users] = await connection.query('SELECT user_id, role FROM users ORDER BY user_id FOR UPDATE');
  if (!users.some((user: any) => user.user_id === actorId && user.role === 'admin')) {
    fail(403, 'Tài khoản không còn quyền quản trị.');
  }
  return users;
}

export function protectAdmin(users: any[], id: number, actorId: number, deleting: boolean, role?: string): void {
  const target = users.find((user: any) => user.user_id === id);
  if (!target) fail(404, 'Không tìm thấy người dùng.');
  if (deleting && id === actorId) fail(409, 'Không thể xóa tài khoản đang đăng nhập.');
  if (target.role === 'admin' && (deleting || role !== 'admin') && users.filter((user: any) => user.role === 'admin').length <= 1) {
    fail(409, 'Phải giữ lại ít nhất một quản trị viên.');
  }
}

export async function validateReferences(connection: any, entity: string, data: any): Promise<void> {
  for (const [field, table, key] of [
    ['artist_id', 'artists', 'artist_id'],
    ['album_id', 'albums', 'album_id'],
    ['user_id', 'users', 'user_id'],
  ]) {
    if (data[field] == null) continue;
    const [rows] = await connection.query(
      `SELECT ${key}${table === 'albums' ? ', artist_id' : ''} FROM ${table} WHERE ${key} = ? FOR UPDATE`,
      [data[field]]
    );
    if (!rows.length) fail(400, `${field}: bản ghi không tồn tại.`);
    if (entity === 'songs' && field === 'album_id' && rows[0].artist_id !== data.artist_id) {
      fail(400, 'Album không thuộc nghệ sĩ đã chọn.');
    }
  }
  if (data.genres?.length) {
    const [rows] = await connection.query('SELECT genre_id FROM genres WHERE genre_id IN (?) FOR UPDATE', [data.genres]);
    if (rows.length !== data.genres.length) fail(400, 'Một hoặc nhiều thể loại không tồn tại.');
  }
}

export async function deletionPreview(connection: any, entity: string, id: number, row: any): Promise<DeletionPreviewResult> {
  const impacts: { label: string; count: number }[] = [];
  async function count(label: string, sql: string, args: any[] = [id]) {
    const [rows] = await connection.query(sql, args);
    const value = Number(rows[0].total);
    if (value) impacts.push({ label, count: value });
  }

  if (entity === 'users') {
    await count('Playlist bị xóa', 'SELECT COUNT(*) AS total FROM playlists WHERE user_id = ?');
    await count(
      'Mục trong playlist bị xóa',
      'SELECT COUNT(*) AS total FROM playlist_songs WHERE playlist_id IN (SELECT playlist_id FROM playlists WHERE user_id = ?)'
    );
    await count('Lượt yêu thích bị xóa', 'SELECT COUNT(*) AS total FROM user_favorite_songs WHERE user_id = ?');
    await count('Lịch sử nghe bị xóa', 'SELECT COUNT(*) AS total FROM listening_history WHERE user_id = ?');
  }
  if (entity === 'artists') {
    await count('Album bị xóa', 'SELECT COUNT(*) AS total FROM albums WHERE artist_id = ?');
    await count('Bài hát bị xóa', 'SELECT COUNT(*) AS total FROM songs WHERE artist_id = ?');
    await count(
      'Bài hát khác được gỡ khỏi album',
      'SELECT COUNT(*) AS total FROM songs WHERE artist_id <> ? AND album_id IN (SELECT album_id FROM albums WHERE artist_id = ?)',
      [id, id]
    );
  }
  if (entity === 'artists' || entity === 'songs') {
    const condition = entity === 'artists' ? 'song_id IN (SELECT song_id FROM songs WHERE artist_id = ?)' : 'song_id = ?';
    for (const [table, label] of [
      ['song_genres', 'Liên kết thể loại bị xóa'],
      ['playlist_songs', 'Mục trong playlist bị xóa'],
      ['user_favorite_songs', 'Lượt yêu thích bị xóa'],
      ['listening_history', 'Lịch sử nghe bị xóa'],
    ]) {
      await count(label, `SELECT COUNT(*) AS total FROM ${table} WHERE ${condition}`);
    }
  }
  if (entity === 'albums') await count('Bài hát được gỡ khỏi album (không xóa bài hát)', 'SELECT COUNT(*) AS total FROM songs WHERE album_id = ?');
  if (entity === 'genres') await count('Liên kết bài hát bị xóa (không xóa bài hát)', 'SELECT COUNT(*) AS total FROM song_genres WHERE genre_id = ?');
  if (entity === 'playlists') await count('Mục trong playlist bị xóa (không xóa bài hát)', 'SELECT COUNT(*) AS total FROM playlist_songs WHERE playlist_id = ?');

  const label = row[(entities as any)[entity].label];
  const confirmation = createHash('sha256')
    .update(JSON.stringify({ entity, id, label, impacts }))
    .digest('hex');
  return { label, impacts, confirmation };
}
