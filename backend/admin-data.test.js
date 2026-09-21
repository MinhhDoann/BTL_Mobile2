const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createAdminDataRouter, normalize, protectAdmin, transaction } = require('./admin-data');

async function harness(t, query, user = { user_id: 1, role: 'admin' }) {
  const events = [];
  const connection = {
    query: async (sql, args = []) => { events.push({ sql, args }); return query(sql, args); },
    beginTransaction: async () => events.push('begin'), commit: async () => events.push('commit'),
    rollback: async () => events.push('rollback'), release: () => events.push('release'),
  };
  const db = { query: connection.query, getConnection: async () => connection };
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => { req.user = user; next(); });
  app.use('/data', createAdminDataRouter(db));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => { server.closeAllConnections(); server.close(); });
  const request = async (path, method = 'GET', body) => {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/data${path}`, { method, headers: { 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    return { status: response.status, body: await response.json() };
  };
  return { request, events, db };
}
const samples = {
  users: { username: 'Lan', email: 'lan@example.test', password: 'mk123@', role: 'user', is_premium: false },
  artists: { name: 'Nghệ sĩ mới', bio: 'Tiểu sử' },
  albums: { title: 'Album mới', artist_id: 4, release_date: '2026-09-21' },
  genres: { name: 'Acoustic' },
  songs: { title: 'Bài hát mới', artist_id: 4, album_id: 5, duration: 180, audio_url: 'https://example.test/song.mp3', genres: [2, 3] },
  playlists: { title: 'Nhạc yêu thích', user_id: 2, is_public: true },
};

test('normalizes all six entities and validates fields without accepting arbitrary columns', () => {
  for (const [entity, sample] of Object.entries(samples)) {
    const result = normalize(entity, { ...sample, unexpected: 'SQL', created_at: 'fake' }, true);
    assert.equal(result.unexpected, undefined);
    assert.equal(result.created_at, undefined);
  }
  assert.equal(normalize('users', { ...samples.users, password: '' }, false).password_hash, undefined);
  assert.equal(normalize('users', samples.users, true).password_hash, 'mk123@');
  assert.throws(() => normalize('users', { ...samples.users, role: 'root' }, true), { status: 400 });
  assert.throws(() => normalize('users', { ...samples.users, password: '' }, true), { status: 400 });
  assert.throws(() => normalize('users', { ...samples.users, email: 'invalid email' }, true), { status: 400 });
  assert.throws(() => normalize('playlists', { ...samples.playlists, is_public: 'false' }, true), { status: 400 });
  assert.throws(() => normalize('songs', { ...samples.songs, duration: -1 }, true), { status: 400 });
  assert.throws(() => normalize('songs', { ...samples.songs, genres: '2,3' }, true), { status: 400 });
  assert.throws(() => normalize('songs', { ...samples.songs, artist_id: '4 OR 1=1' }, true), { status: 400 });
  assert.throws(() => normalize('albums', { ...samples.albums, release_date: '2026-02-30' }, true), { status: 400 });
  assert.throws(() => normalize('artists', { name: ' ' }, true), { status: 400 });
});

test('lists every entity with pagination, literal search parameters, and no password projection', async (t) => {
  const h = await harness(t, async (sql) => sql.startsWith('SELECT COUNT') ? [[{ total: 21 }]] : [[{ title: 'Example' }]]);
  for (const entity of Object.keys(samples)) {
    const result = await h.request(`/${entity}?page=99&pageSize=20&q=${encodeURIComponent("%' OR 1=1 --")}`);
    assert.equal(result.status, 200);
    assert.equal(result.body.page, 2);
    assert.equal(result.body.total, 21);
  }
  const listQueries = h.events.filter((event) => event.sql?.includes('LIMIT'));
  assert.equal(listQueries.length, 6);
  for (const { sql, args } of listQueries) {
    assert.ok(!sql.includes('password_hash'));
    assert.ok(!sql.includes('OR 1=1 --'));
    assert.deepEqual(args.slice(-2), [20, 20]);
  }
  assert.equal((await h.request('/users?page=0')).status, 400);
  assert.equal((await h.request('/users?page=1.5')).status, 400);
  assert.equal((await h.request('/users?q[x]=1')).status, 200); // Express treats this as an unrelated query parameter.
  assert.equal((await h.request('/users?q=a&q=b')).status, 400);
  assert.equal((await h.request('/password_hash')).status, 404);
  assert.equal((await h.request('/constructor')).status, 404);
});

test('empty lists remain on page one and detail reads omit passwords', async (t) => {
  const h = await harness(t, async (sql) => {
    assert.ok(!sql.includes('password_hash'));
    if (sql.startsWith('SELECT COUNT')) return [[{ total: 0 }]];
    return [[]];
  });
  assert.deepEqual((await h.request('/users?page=3')).body, { items: [], total: 0, page: 1, pageSize: 20 });
  assert.equal((await h.request('/users/99')).status, 404);
  assert.equal((await h.request('/users/nope')).status, 400);
});

test('creates all entities and commits song relations in the same transaction', async (t) => {
  const h = await harness(t, async (sql) => {
    if (sql.includes('FROM users ORDER BY')) return [[{ user_id: 1, role: 'admin' }]];
    if (sql.includes('FROM artists')) return [[{ artist_id: 4 }]];
    if (sql.includes('FROM albums')) return [[{ album_id: 5, artist_id: 4 }]];
    if (sql.includes('FROM users WHERE')) return [[{ user_id: 2 }]];
    if (sql.includes('FROM genres')) return [[{ genre_id: 2 }, { genre_id: 3 }]];
    if (sql.startsWith('INSERT')) return [{ insertId: 10 }];
    throw new Error(`Unexpected query: ${sql}`);
  });
  for (const [entity, sample] of Object.entries(samples)) {
    const result = await h.request(`/${entity}`, 'POST', sample);
    assert.equal(result.status, 201, JSON.stringify(result.body));
    assert.equal(result.body.id, 10);
  }
  assert.equal(h.events.filter((event) => event === 'commit').length, 6);
  assert.ok(!h.events.includes('rollback'));
  assert.deepEqual(h.events.find((event) => event.sql?.startsWith('INSERT INTO song_genres')).args, [[[10, 2], [10, 3]]]);
});

test('updates users without changing a blank password and replaces song genres', async (t) => {
  const h = await harness(t, async (sql) => {
    if (sql.includes('FROM users ORDER BY')) return [[{ user_id: 1, role: 'admin' }, { user_id: 2, role: 'user' }]];
    if (sql.startsWith('SELECT')) return [[{ user_id: 2, song_id: 2, artist_id: 4 }]];
    return [{ affectedRows: 1 }];
  });
  assert.equal((await h.request('/users/2', 'PUT', { ...samples.users, password: '' })).status, 200);
  const update = h.events.find((event) => event.sql?.startsWith('UPDATE users'));
  assert.equal(update.args[0].password_hash, undefined);
  assert.equal((await h.request('/songs/2', 'PUT', { ...samples.songs, genres: [], album_id: null })).status, 200);
  assert.ok(h.events.some((event) => event.sql === 'DELETE FROM song_genres WHERE song_id = ?'));
});

test('invalid references, duplicate values, and relation failures roll back the write', async (t) => {
  const missing = await harness(t, async () => [[]]);
  assert.equal((await missing.request('/playlists', 'POST', samples.playlists)).status, 400);
  assert.ok(missing.events.includes('rollback'));
  const duplicate = await harness(t, async () => { throw Object.assign(new Error('duplicate'), { code: 'ER_DUP_ENTRY' }); });
  assert.equal((await duplicate.request('/genres', 'POST', samples.genres)).status, 409);
  assert.ok(duplicate.events.includes('rollback'));
  const partial = await harness(t, async (sql) => {
    if (sql.startsWith('SELECT')) return [[{ artist_id: 4, genre_id: 2 }]];
    if (sql.startsWith('INSERT INTO song_genres')) throw new Error('relation failed');
    return [{ insertId: 10 }];
  });
  assert.equal((await partial.request('/songs', 'POST', { ...samples.songs, album_id: null, genres: [2] })).status, 500);
  assert.ok(partial.events.includes('rollback'));
  assert.ok(!partial.events.includes('commit'));
  assert.equal(partial.events.at(-1), 'release');
});

test('self deletion, last admin removal and demotion are refused under a transaction lock', async (t) => {
  const h = await harness(t, async () => [[{ user_id: 1, role: 'admin' }]]);
  assert.equal((await h.request('/users/1/delete-preview')).status, 409);
  assert.equal((await h.request('/users/1', 'DELETE', { confirmation: 'fake' })).status, 409);
  assert.equal((await h.request('/users/1', 'PUT', { ...samples.users, password: '' })).status, 409);
  assert.ok(h.events.some((event) => event.sql?.endsWith('ORDER BY user_id FOR UPDATE')));
  assert.throws(() => protectAdmin([{ user_id: 9, role: 'admin' }], 9, 1, true), { status: 409 });
  assert.doesNotThrow(() => protectAdmin([{ user_id: 1, role: 'admin' }, { user_id: 2, role: 'admin' }], 2, 1, true));
});

test('delete requires current impact confirmation and does not write before confirmation', async (t) => {
  let related = 3;
  const h = await harness(t, async (sql) => {
    if (sql.startsWith('SELECT COUNT')) return [[{ total: related }]];
    if (sql.startsWith('SELECT')) return [[{ album_id: 5, title: 'Album của tôi' }]];
    return [{ affectedRows: 1 }];
  });
  assert.equal((await h.request('/albums/5', 'DELETE', {})).status, 400);
  const preview = await h.request('/albums/5/delete-preview');
  assert.equal(preview.body.label, 'Album của tôi');
  assert.equal(preview.body.impacts[0].count, 3);
  assert.ok(!h.events.some((event) => event.sql?.startsWith('DELETE')));
  related = 4;
  assert.equal((await h.request('/albums/5', 'DELETE', { confirmation: preview.body.confirmation })).status, 409);
  const refreshed = await h.request('/albums/5/delete-preview');
  assert.equal((await h.request('/albums/5', 'DELETE', { confirmation: refreshed.body.confirmation })).status, 200);
  assert.equal(h.events.filter((event) => event.sql?.startsWith('DELETE')).length, 1);
});

test('router denies unauthenticated/non-admin callers before querying the database', async (t) => {
  for (const user of [null, { user_id: 2, role: 'user' }]) {
    const h = await harness(t, () => { assert.fail('Must not query database'); }, user);
    for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
      const result = await h.request(method === 'GET' || method === 'POST' ? '/users' : '/users/1', method, method === 'GET' ? undefined : {});
      assert.equal(result.status, user ? 403 : 401);
    }
  }
});

test('connection is released when starting a transaction fails', async () => {
  let released = false;
  const db = { getConnection: async () => ({ beginTransaction: async () => { throw new Error('offline'); }, rollback: async () => {}, release: () => { released = true; } }) };
  await assert.rejects(transaction(db, () => {}), /offline/);
  assert.equal(released, true);
});
