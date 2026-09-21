const { randomBytes, createHash } = require('node:crypto');
const express = require('express');

const SESSION_TTL = 8 * 60 * 60 * 1000;

function verifyPassword(password, storedPassword) {
  // Demo mode: the existing password_hash column stores plain-text passwords.
  return typeof password === 'string' && password.length > 0
    && typeof storedPassword === 'string' && password === storedPassword;
}

function createAuth(db, { now = Date.now } = {}) {
  const router = express.Router();
  const sessions = new Map();
  const attempts = new Map();
  const tokenKey = (token) => createHash('sha256').update(token).digest('hex');
  const publicUser = ({ user_id, username, email, role }) => ({ user_id, username, email, role });
  const cleanup = setInterval(() => {
    for (const [key, value] of sessions) if (value.expires <= now()) sessions.delete(key);
    for (const [key, value] of attempts) if (value.expires <= now()) attempts.delete(key);
  }, 60_000);
  cleanup.unref();

  async function authenticate(req, res, next) {
    const token = req.get('authorization')?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
    const key = token ? tokenKey(token) : null;
    const session = key && sessions.get(key);
    if (!session || session.expires <= now()) {
      if (key) sessions.delete(key);
      return res.status(401).json({ message: 'Vui lòng đăng nhập lại.' });
    }
    try {
      // Read the current database role on every request, including after role changes.
      const [rows] = await db.query('SELECT user_id, username, email, role FROM users WHERE user_id = ?', [session.userId]);
      if (!rows.length) {
        sessions.delete(key);
        return res.status(401).json({ message: 'Tài khoản không còn tồn tại.' });
      }
      req.user = publicUser(rows[0]);
      req.sessionKey = key;
      next();
    } catch {
      res.status(503).json({ message: 'Không thể xác thực tài khoản lúc này.' });
    }
  }

  router.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  router.post('/login', async (req, res) => {
    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || email.length > 100 || !password || password.length > 256) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu hợp lệ.' });
    }
    const key = req.ip;
    let attempt = attempts.get(key);
    if (!attempt || attempt.expires <= now()) {
      attempt = { count: 0, expires: now() + 15 * 60_000 };
      attempts.set(key, attempt);
    }
    if (++attempt.count > 20) return res.status(429).json({ message: 'Thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.' });
    try {
      const [rows] = await db.query('SELECT user_id, username, email, role, password_hash FROM users WHERE email = ? LIMIT 1', [email.trim()]);
      const user = rows[0];
      const valid = verifyPassword(password, user?.password_hash);
      if (!user || !valid) return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
      const token = randomBytes(32).toString('hex');
      sessions.set(tokenKey(token), { userId: user.user_id, expires: now() + SESSION_TTL });
      res.json({ token, user: publicUser(user) });
    } catch {
      res.status(503).json({ message: 'Không thể đăng nhập lúc này.' });
    }
  });
  router.get('/me', authenticate, (req, res) => res.json({ user: req.user }));
  router.post('/logout', authenticate, (req, res) => {
    sessions.delete(req.sessionKey);
    res.sendStatus(204);
  });
  function requireAdmin(req, res, next) {
    authenticate(req, res, () => {
      if (req.user.role !== 'admin') return res.status(403).json({ message: 'Chỉ quản trị viên được phép thực hiện thao tác này.' });
      res.set('Cache-Control', 'no-store');
      next();
    });
  }
  return { router, requireAdmin, close: () => clearInterval(cleanup) };
}

module.exports = { createAuth, verifyPassword };
