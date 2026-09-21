import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { AddressInfo } from 'node:net';
import { createAuth, verifyPassword } from '../src/services/auth.service';
import { createAdminDataRouter } from '../src/routes/admin-data.routes';

test('plain-text passwords require an exact nonempty string match', () => {
  assert.equal(verifyPassword('mk123@', 'mk123@'), true);
  assert.equal(verifyPassword('wrong', 'mk123@'), false);
  assert.equal(verifyPassword('MK123@', 'mk123@'), false);
  assert.equal(verifyPassword(' mk123@ ', 'mk123@'), false);
  assert.equal(verifyPassword('', ''), false);
  assert.equal(verifyPassword(undefined, undefined), false);
  assert.equal(verifyPassword('mk123@', null), false);
  assert.equal(verifyPassword('mk123@', 'scrypt:old-hash'), false);
});

test('login, database role enforcement, expiry, and logout', async (t) => {
  let time = Date.now();
  const users = [
    { user_id: 1, username: 'admin', email: 'admin@example.test', role: 'admin', password_hash: 'mk123@' },
    { user_id: 2, username: 'listener', email: 'user@example.test', role: 'user', password_hash: 'user-password-123' },
  ];
  const db = {
    query: async (sql: string, args: any[] = []) => [
      users.filter((user) => (sql.includes('WHERE email') ? user.email === args[0] : user.user_id === args[0])),
    ],
  };
  const auth = createAuth(db, { now: () => time });
  const app = express();
  app.use(express.json());
  app.use('/api/auth', auth.router);
  app.use('/api/admin', auth.requireAdmin as any);
  app.use('/api/admin/data', createAdminDataRouter(db));
  app.get('/api/admin/dashboard', (_req, res) => res.json({ ok: true }));
  app.post('/api/admin/songs', (_req, res) => res.sendStatus(201));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => {
    auth.close();
    server.closeAllConnections();
    server.close();
  });
  const address = server.address() as AddressInfo;
  const base = `http://127.0.0.1:${address.port}`;
  const request = (path: string, token?: string | null, body?: any) =>
    fetch(base + path, {
      method: body ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

  assert.equal((await request('/api/admin/dashboard')).status, 401);
  assert.equal((await request('/api/admin/songs', null, {})).status, 401);
  assert.equal((await request('/api/admin/data/users')).status, 401);
  assert.equal((await request('/api/auth/login', null, { email: users[0].email, password: 'wrong' })).status, 401);
  assert.equal((await request('/api/auth/login', null, { email: {}, password: [] })).status, 400);

  const userLogin = (await (
    await request('/api/auth/login', null, { email: users[1].email, password: 'user-password-123', role: 'admin' })
  ).json()) as any;
  assert.equal(userLogin.user.role, 'user');
  assert.equal((await request('/api/admin/dashboard', userLogin.token)).status, 403);
  assert.equal((await request('/api/admin/songs', userLogin.token, {})).status, 403);
  assert.equal((await request('/api/admin/data/users', userLogin.token)).status, 403);
  assert.equal((await request('/api/admin/data/users', userLogin.token, { role: 'admin' })).status, 403);

  const login = (await (
    await request('/api/auth/login', null, { email: users[0].email, password: 'mk123@' })
  ).json()) as any;
  assert.equal(login.user.password_hash, undefined);
  assert.equal((await request('/api/admin/dashboard', login.token)).status, 200);
  assert.equal((await request('/api/admin/songs', login.token, {})).status, 201);

  users[0].role = 'user';
  assert.equal((await request('/api/admin/dashboard', login.token)).status, 403);
  assert.equal(((await (await request('/api/auth/me', login.token)).json()) as any).user.role, 'user');

  users[0].role = 'admin';
  assert.equal((await request('/api/auth/logout', login.token, {})).status, 204);
  assert.equal((await request('/api/admin/dashboard', login.token)).status, 401);

  time += 9 * 60 * 60 * 1000;
  assert.equal((await request('/api/auth/me', userLogin.token)).status, 401);
  assert.equal((await request('/api/admin/dashboard', '0'.repeat(64))).status, 401);

  const deletedLogin = (await (
    await request('/api/auth/login', null, { email: users[1].email, password: 'user-password-123' })
  ).json()) as any;
  users.pop();
  assert.equal((await request('/api/auth/me', deletedLogin.token)).status, 401);

  for (let attempt = 0; attempt < 20; attempt++) {
    await request('/api/auth/login', null, { email: 'missing@example.test', password: 'wrong' });
  }
  assert.equal((await request('/api/auth/login', null, { email: 'missing@example.test', password: 'wrong' })).status, 429);
});
