const express = require('express');
const { createHash } = require('node:crypto');

// SQL identifiers and joins come only from this whitelist, never from request input.
const entities = {
  users: { id: 'user_id', label: 'username', fields: ['username', 'email', 'avatar_url', 'role', 'is_premium', 'created_at'], search: ['t.username', 't.email'], joins: '', extra: '' },
  songs: { id: 'song_id', label: 'title', fields: ['title', 'duration', 'audio_url', 'cover_url', 'lyrics', 'artist_id', 'album_id', 'play_count'], search: ['t.title', 'a.name'], joins: 'LEFT JOIN artists a ON a.artist_id = t.artist_id LEFT JOIN albums al ON al.album_id = t.album_id', extra: ', a.name AS artist_name, al.title AS album_title' },
  artists: { id: 'artist_id', label: 'name', fields: ['name', 'bio', 'avatar_url'], search: ['t.name'], joins: '', extra: '' },
  albums: { id: 'album_id', label: 'title', fields: ['title', 'cover_url', 'release_date', 'artist_id'], search: ['t.title', 'a.name'], joins: 'LEFT JOIN artists a ON a.artist_id = t.artist_id', extra: ', a.name AS artist_name' },
  genres: { id: 'genre_id', label: 'name', fields: ['name'], search: ['t.name'], joins: '', extra: '' },
  playlists: { id: 'playlist_id', label: 'title', fields: ['title', 'description', 'cover_url', 'user_id', 'is_public'], search: ['t.title', 'u.username'], joins: 'LEFT JOIN users u ON u.user_id = t.user_id', extra: ', u.username AS owner_name, (SELECT COUNT(*) FROM playlist_songs ps WHERE ps.playlist_id = t.playlist_id) AS song_count' },
};
function fail(status, message) { throw Object.assign(new Error(message), { status }); }
function selectFields(config, prefix = '') {
  return [config.id, ...config.fields].map((field) => field === 'release_date' ? `DATE_FORMAT(${prefix}${field}, '%Y-%m-%d') AS release_date` : `${prefix}${field}`).join(', ');
}
function integer(value, name, optional = false) {
  if (optional && (value === '' || value === null || value === undefined)) return null;
  if (!['number', 'string'].includes(typeof value) || !/^\d+$/.test(String(value)) || !Number.isSafeInteger(Number(value)) || Number(value) < 1 || Number(value) > 2147483647) fail(400, `${name} phải là số nguyên dương hợp lệ.`);
  return Number(value);
}
function text(value, name, max, required = false, trim = true) {
  if (value === undefined || value === null || value === '') {
    if (required) fail(400, `Vui lòng nhập ${name}.`);
    return null;
  }
  if (typeof value !== 'string') fail(400, `${name} không hợp lệ.`);
  const result = trim ? value.trim() : value;
  if ((required && !result) || result.length > max) fail(400, `${name} không hợp lệ (tối đa ${max} ký tự).`);
  return result || null;
}
function boolean(value, name) {
  if (![true, false, 0, 1].includes(value)) fail(400, `${name} không hợp lệ.`);
  return value ? 1 : 0;
}
function normalize(entity, body, creating) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) fail(400, 'Dữ liệu không hợp lệ.');
  const url = (field) => text(body[field], field, 255);
  switch (entity) {
    case 'users': {
      const email = text(body.email, 'email', 100, true);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail(400, 'Email không hợp lệ.');
      if (!['user', 'admin'].includes(body.role)) fail(400, 'Role phải là user hoặc admin.');
      const data = { username: text(body.username, 'tên người dùng', 50, true), email, avatar_url: url('avatar_url'), role: body.role, is_premium: boolean(body.is_premium, 'Premium') };
      if (creating || (body.password !== '' && body.password !== undefined)) data.password_hash = text(body.password, 'mật khẩu', 255, true, false);
      return data;
    }
    case 'artists': return { name: text(body.name, 'tên nghệ sĩ', 100, true), bio: text(body.bio, 'tiểu sử', 16000), avatar_url: url('avatar_url') };
    case 'genres': return { name: text(body.name, 'tên thể loại', 50, true) };
    case 'albums': {
      const date = text(body.release_date, 'ngày phát hành', 10);
      if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date)) fail(400, 'Ngày phát hành không hợp lệ.');
      return { title: text(body.title, 'tên album', 100, true), artist_id: integer(body.artist_id, 'Nghệ sĩ', true), cover_url: url('cover_url'), release_date: date };
    }
    case 'songs': {
      if (!Array.isArray(body.genres) || body.genres.length > 200) fail(400, 'Danh sách thể loại không hợp lệ.');
      return { title: text(body.title, 'tên bài hát', 150, true), duration: integer(body.duration, 'Thời lượng'), audio_url: text(body.audio_url, 'Audio URL', 255, true), cover_url: url('cover_url'), lyrics: text(body.lyrics, 'lời bài hát', 16000), artist_id: integer(body.artist_id, 'Nghệ sĩ'), album_id: integer(body.album_id, 'Album', true), genres: [...new Set(body.genres.map((id) => integer(id, 'Thể loại')))] };
    }
    case 'playlists': return { title: text(body.title, 'tên playlist', 100, true), description: text(body.description, 'mô tả', 16000), cover_url: url('cover_url'), user_id: integer(body.user_id, 'Người sở hữu'), is_public: boolean(body.is_public, 'Công khai') };
    default: fail(404, 'Mục quản lý không tồn tại.');
  }
}
async function transaction(db, work) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally { connection.release(); }
}
async function lockUsers(connection, actorId) {
  // Serialize account edits so concurrent requests cannot remove the last admin.
  const [users] = await connection.query('SELECT user_id, role FROM users ORDER BY user_id FOR UPDATE');
  if (!users.some((user) => user.user_id === actorId && user.role === 'admin')) fail(403, 'Tài khoản không còn quyền quản trị.');
  return users;
}
function protectAdmin(users, id, actorId, deleting, role) {
  const target = users.find((user) => user.user_id === id);
  if (!target) fail(404, 'Không tìm thấy người dùng.');
  if (deleting && id === actorId) fail(409, 'Không thể xóa tài khoản đang đăng nhập.');
  if (target.role === 'admin' && (deleting || role !== 'admin') && users.filter((user) => user.role === 'admin').length <= 1) fail(409, 'Phải giữ lại ít nhất một quản trị viên.');
}
async function validateReferences(connection, entity, data) {
  for (const [field, table, key] of [['artist_id', 'artists', 'artist_id'], ['album_id', 'albums', 'album_id'], ['user_id', 'users', 'user_id']]) {
    if (data[field] == null) continue;
    const [rows] = await connection.query(`SELECT ${key}${table === 'albums' ? ', artist_id' : ''} FROM ${table} WHERE ${key} = ? FOR UPDATE`, [data[field]]);
    if (!rows.length) fail(400, `${field}: bản ghi không tồn tại.`);
    if (entity === 'songs' && field === 'album_id' && rows[0].artist_id !== data.artist_id) fail(400, 'Album không thuộc nghệ sĩ đã chọn.');
  }
  if (data.genres?.length) {
    const [rows] = await connection.query('SELECT genre_id FROM genres WHERE genre_id IN (?) FOR UPDATE', [data.genres]);
    if (rows.length !== data.genres.length) fail(400, 'Một hoặc nhiều thể loại không tồn tại.');
  }
}
async function deletionPreview(connection, entity, id, row) {
  const impacts = [];
  async function count(label, sql, args = [id]) {
    const [rows] = await connection.query(sql, args);
    const value = Number(rows[0].total);
    if (value) impacts.push({ label, count: value });
  }
  if (entity === 'users') {
    await count('Playlist bị xóa', 'SELECT COUNT(*) AS total FROM playlists WHERE user_id = ?');
    await count('Mục trong playlist bị xóa', 'SELECT COUNT(*) AS total FROM playlist_songs WHERE playlist_id IN (SELECT playlist_id FROM playlists WHERE user_id = ?)');
    await count('Lượt yêu thích bị xóa', 'SELECT COUNT(*) AS total FROM user_favorite_songs WHERE user_id = ?');
    await count('Lịch sử nghe bị xóa', 'SELECT COUNT(*) AS total FROM listening_history WHERE user_id = ?');
  }
  if (entity === 'artists') {
    await count('Album bị xóa', 'SELECT COUNT(*) AS total FROM albums WHERE artist_id = ?');
    await count('Bài hát bị xóa', 'SELECT COUNT(*) AS total FROM songs WHERE artist_id = ?');
    await count('Bài hát khác được gỡ khỏi album', 'SELECT COUNT(*) AS total FROM songs WHERE artist_id <> ? AND album_id IN (SELECT album_id FROM albums WHERE artist_id = ?)', [id, id]);
  }
  if (entity === 'artists' || entity === 'songs') {
    const condition = entity === 'artists' ? 'song_id IN (SELECT song_id FROM songs WHERE artist_id = ?)' : 'song_id = ?';
    for (const [table, label] of [['song_genres', 'Liên kết thể loại bị xóa'], ['playlist_songs', 'Mục trong playlist bị xóa'], ['user_favorite_songs', 'Lượt yêu thích bị xóa'], ['listening_history', 'Lịch sử nghe bị xóa']]) await count(label, `SELECT COUNT(*) AS total FROM ${table} WHERE ${condition}`);
  }
  if (entity === 'albums') await count('Bài hát được gỡ khỏi album (không xóa bài hát)', 'SELECT COUNT(*) AS total FROM songs WHERE album_id = ?');
  if (entity === 'genres') await count('Liên kết bài hát bị xóa (không xóa bài hát)', 'SELECT COUNT(*) AS total FROM song_genres WHERE genre_id = ?');
  if (entity === 'playlists') await count('Mục trong playlist bị xóa (không xóa bài hát)', 'SELECT COUNT(*) AS total FROM playlist_songs WHERE playlist_id = ?');
  const label = row[entities[entity].label];
  const confirmation = createHash('sha256').update(JSON.stringify({ entity, id, label, impacts })).digest('hex');
  return { label, impacts, confirmation };
}

function createAdminDataRouter(db) {
  const router = express.Router();
  router.use((req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Vui lòng đăng nhập.' });
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Chỉ quản trị viên được truy cập.' });
    res.set('Cache-Control', 'no-store');
    next();
  });
  router.param('entity', (req, res, next, name) => {
    if (!Object.hasOwn(entities, name)) return res.status(404).json({ message: 'Mục quản lý không tồn tại.' });
    req.entityConfig = entities[name];
    next();
  });
  router.get('/:entity', async (req, res) => {
    const { entity } = req.params;
    const config = req.entityConfig;
    const page = integer(req.query.page ?? '1', 'Trang');
    const pageSize = Math.min(integer(req.query.pageSize ?? '20', 'Số dòng'), 100);
    const query = text(req.query.q, 'tìm kiếm', 100) || '';
    const where = query ? `WHERE (${config.search.map((field) => `${field} LIKE ?`).join(' OR ')})` : '';
    const args = query ? config.search.map(() => `%${query.replace(/[\\%_]/g, '\\$&')}%`) : [];
    const from = `FROM ${entity} t ${config.joins} ${where}`;
    const [counts] = await db.query(`SELECT COUNT(*) AS total ${from}`, args);
    const total = Number(counts[0].total);
    const actualPage = Math.min(page, Math.max(1, Math.ceil(total / pageSize)));
    const fields = selectFields(config, 't.');
    const [rows] = await db.query(`SELECT ${fields}${config.extra} ${from} ORDER BY t.${config.id} DESC LIMIT ? OFFSET ?`, [...args, pageSize, (actualPage - 1) * pageSize]);
    res.json({ items: rows, page: actualPage, pageSize, total });
  });
  router.get('/:entity/:id', async (req, res) => {
    const { entity } = req.params;
    const config = req.entityConfig;
    const id = integer(req.params.id, 'ID');
    const [rows] = await db.query(`SELECT ${selectFields(config)} FROM ${entity} WHERE ${config.id} = ?`, [id]);
    if (!rows.length) fail(404, 'Bản ghi không còn tồn tại.');
    if (entity === 'songs') {
      const [genres] = await db.query('SELECT genre_id FROM song_genres WHERE song_id = ?', [id]);
      rows[0].genres = genres.map((genre) => genre.genre_id);
    }
    res.json(rows[0]);
  });
  router.post('/:entity', async (req, res) => {
    const { entity } = req.params;
    const data = normalize(entity, req.body, true);
    const id = await transaction(db, async (connection) => {
      if (entity === 'users') await lockUsers(connection, req.user.user_id);
      await validateReferences(connection, entity, data);
      const { genres, ...fields } = data;
      const [result] = await connection.query(`INSERT INTO ${entity} SET ?`, [fields]);
      if (genres?.length) await connection.query('INSERT INTO song_genres (song_id, genre_id) VALUES ?', [genres.map((genre) => [result.insertId, genre])]);
      return result.insertId;
    });
    res.status(201).json({ id, message: 'Đã thêm dữ liệu.' });
  });
  router.put('/:entity/:id', async (req, res) => {
    const { entity } = req.params;
    const id = integer(req.params.id, 'ID');
    const data = normalize(entity, req.body, false);
    await transaction(db, async (connection) => {
      if (entity === 'users') protectAdmin(await lockUsers(connection, req.user.user_id), id, req.user.user_id, false, data.role);
      const [rows] = await connection.query(`SELECT ${req.entityConfig.id} FROM ${entity} WHERE ${req.entityConfig.id} = ? FOR UPDATE`, [id]);
      if (!rows.length) fail(404, 'Bản ghi không còn tồn tại.');
      await validateReferences(connection, entity, data);
      const { genres, ...fields } = data;
      await connection.query(`UPDATE ${entity} SET ? WHERE ${req.entityConfig.id} = ?`, [fields, id]);
      if (genres) {
        await connection.query('DELETE FROM song_genres WHERE song_id = ?', [id]);
        if (genres.length) await connection.query('INSERT INTO song_genres (song_id, genre_id) VALUES ?', [genres.map((genre) => [id, genre])]);
      }
    });
    res.json({ message: 'Đã lưu thay đổi.' });
  });
  router.get('/:entity/:id/delete-preview', async (req, res) => {
    const id = integer(req.params.id, 'ID');
    const { entity } = req.params;
    const result = await transaction(db, async (connection) => {
      if (entity === 'users') protectAdmin(await lockUsers(connection, req.user.user_id), id, req.user.user_id, true);
      const [rows] = await connection.query(`SELECT ${req.entityConfig.id}, ${req.entityConfig.label} FROM ${entity} WHERE ${req.entityConfig.id} = ? FOR UPDATE`, [id]);
      if (!rows.length) fail(404, 'Bản ghi không còn tồn tại.');
      return deletionPreview(connection, entity, id, rows[0]);
    });
    res.json(result);
  });
  router.delete('/:entity/:id', async (req, res) => {
    const id = integer(req.params.id, 'ID');
    const { entity } = req.params;
    if (typeof req.body?.confirmation !== 'string') fail(400, 'Vui lòng xem và xác nhận dữ liệu sẽ bị xóa.');
    await transaction(db, async (connection) => {
      if (entity === 'users') protectAdmin(await lockUsers(connection, req.user.user_id), id, req.user.user_id, true);
      const [rows] = await connection.query(`SELECT ${req.entityConfig.id}, ${req.entityConfig.label} FROM ${entity} WHERE ${req.entityConfig.id} = ? FOR UPDATE`, [id]);
      if (!rows.length) fail(404, 'Bản ghi không còn tồn tại.');
      const preview = await deletionPreview(connection, entity, id, rows[0]);
      if (req.body.confirmation !== preview.confirmation) fail(409, 'Dữ liệu liên quan đã thay đổi. Hãy hủy và mở lại xác nhận xóa.');
      await connection.query(`DELETE FROM ${entity} WHERE ${req.entityConfig.id} = ?`, [id]);
    });
    res.json({ message: 'Đã xóa dữ liệu.' });
  });
  router.use((error, _req, res, _next) => {
    const status = error.status || (error.code === 'ER_DUP_ENTRY' || error.code === 'ER_LOCK_DEADLOCK' ? 409 : error.code === 'ER_NO_REFERENCED_ROW_2' ? 400 : 500);
    res.status(status).json({ message: error.status ? error.message : error.code === 'ER_DUP_ENTRY' ? 'Email hoặc tên thể loại đã tồn tại.' : status === 409 ? 'Dữ liệu đang được cập nhật. Vui lòng thử lại.' : status === 400 ? 'Bản ghi liên quan không còn tồn tại.' : 'Không thể xử lý dữ liệu. Vui lòng thử lại.' });
  });
  return router;
}
module.exports = { createAdminDataRouter, normalize, protectAdmin, transaction };
