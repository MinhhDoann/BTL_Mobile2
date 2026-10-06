import { createHash, randomBytes } from 'node:crypto';
import express, { NextFunction, Request, Response, Router } from 'express';
import { AuthRequest, LoginAttempt, PublicUser, Session, User } from '../types/auth.types';
import { sendPasswordMail } from '../utils/mailer';

export const SESSION_TTL = 8 * 60 * 60 * 1000;

export function verifyPassword(password: unknown, storedPassword: unknown): boolean {
  // Demo mode: password_hash column stores plain-text passwords
  return (
    typeof password === 'string' &&
    password.length > 0 &&
    typeof storedPassword === 'string' &&
    password === storedPassword
  );
}

export interface DbQueryable {
  query: (sql: string, args?: any[]) => Promise<any>;
}

export interface AuthOptions {
  now?: () => number;
}

export interface AuthServiceResult {
  router: Router;
  authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>;
  requireAdmin: (req: AuthRequest, res: Response, next: NextFunction) => void;
  requireArtist: (req: AuthRequest, res: Response, next: NextFunction) => void;
  close: () => void;
}

export function createAuth(db: DbQueryable, { now = Date.now }: AuthOptions = {}): AuthServiceResult {
  const router = express.Router();
  const sessions = new Map<string, Session>();
  const attempts = new Map<string, LoginAttempt>();

  const tokenKey = (token: string): string => createHash('sha256').update(token).digest('hex');
  const publicUser = ({ user_id, username, email, role, artist_request_status }: User): PublicUser => ({
    user_id,
    username,
    email,
    role,
    artist_request_status,
  });

  const cleanup = setInterval(() => {
    for (const [key, value] of sessions) {
      if (value.expires <= now()) sessions.delete(key);
    }
    for (const [key, value] of attempts) {
      if (value.expires <= now()) attempts.delete(key);
    }
  }, 60_000);
  (cleanup as any).unref?.();

  async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.get('authorization');
    const token = authHeader?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
    const key = token ? tokenKey(token) : undefined;
    const session = key ? sessions.get(key) : undefined;

    if (!key || !session || session.expires <= now()) {
      if (key) sessions.delete(key);
      return res.status(401).json({ message: 'Vui lòng đăng nhập lại.' });
    }

    try {
      const [rows] = await db.query(
        'SELECT user_id, username, email, role, artist_request_status FROM users WHERE user_id = ?',
        [session.userId]
      );
      if (!rows || !rows.length) {
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

  router.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });

  router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      email.length > 100 ||
      !password ||
      password.length > 256
    ) {
      return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu hợp lệ.' });
    }

    const key = req.ip || 'unknown';
    let attempt = attempts.get(key);
    if (!attempt || attempt.expires <= now()) {
      attempt = { count: 0, expires: now() + 15 * 60_000 };
      attempts.set(key, attempt);
    }

    if (++attempt.count > 20) {
      return res.status(429).json({ message: 'Thử đăng nhập quá nhiều lần. Vui lòng thử lại sau 15 phút.' });
    }

    try {
      const [rows] = await db.query(
        'SELECT user_id, username, email, role, password_hash, artist_request_status FROM users WHERE email = ? LIMIT 1',
        [email.trim()]
      );
      const user = rows?.[0];
      const valid = verifyPassword(password, user?.password_hash);
      if (!user || !valid) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
      }

      const token = randomBytes(32).toString('hex');
      sessions.set(tokenKey(token), { userId: user.user_id, expires: now() + SESSION_TTL });
      res.json({ token, user: publicUser(user) });
    } catch {
      res.status(503).json({ message: 'Không thể đăng nhập lúc này.' });
    }
  });

  router.post('/register', async (req: Request, res: Response) => {
    const { username, email, password, role, avatar_url, bio } = req.body ?? {};
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin.' });
    }
    
    try {
      const [existing]: [any[], any] = await db.query('SELECT user_id FROM users WHERE email = ?', [email.trim()]);
      if (existing && existing.length > 0) {
        return res.status(400).json({ message: 'Email đã được sử dụng.' });
      }
      
      const isRequestingArtist = role === 'artist';
      const insertRole = 'user'; // All new accounts start as user
      const requestStatus = isRequestingArtist ? 'pending' : 'none';
      let result: any;
      try {
        const [insertRes] = await db.query(
          'INSERT INTO users (username, email, password_hash, role, avatar_url, artist_request_status) VALUES (?, ?, ?, ?, ?, ?)',
          [username.trim(), email.trim(), password, insertRole, avatar_url || null, requestStatus]
        );
        result = insertRes;
      } catch (e: any) {
        if (e.message && e.message.includes('avatar_url')) {
          const [insertRes] = await db.query(
            'INSERT INTO users (username, email, password_hash, role, artist_request_status) VALUES (?, ?, ?, ?, ?)',
            [username.trim(), email.trim(), password, insertRole, requestStatus]
          );
          result = insertRes;
        } else {
          throw e;
        }
      }
      
      const userId = result.insertId;
      
      if (isRequestingArtist) {
        const { bio, address } = req.body ?? {};
        const fullBio = (address ? `Địa chỉ: ${address}\n\n` : '') + (bio || 'Chưa có tiểu sử.');
        const name = username.trim();
        const avatar = avatar_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400';
        await db.query(
          'INSERT INTO artists (name, bio, avatar_url, user_id) VALUES (?, ?, ?, ?)',
          [name, fullBio, avatar, userId]
        );
      }
      
      const user = { user_id: userId, username: username.trim(), email: email.trim(), role: insertRole, artist_request_status: requestStatus };
      const token = randomBytes(32).toString('hex');
      sessions.set(tokenKey(token), { userId: user.user_id, expires: now() + SESSION_TTL });
      res.json({ token, user: publicUser(user as any) });
    } catch (err: any) {
      console.error(err);
      res.status(503).json({ message: 'Không thể đăng ký lúc này.' });
    }
  });

  router.post('/change-password', authenticate as any, async (req: AuthRequest, res: Response) => {
    const { oldPassword, newPassword } = req.body ?? {};
    const userId = req.user?.user_id;

    if (!oldPassword || !newPassword || typeof oldPassword !== 'string' || typeof newPassword !== 'string') {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới.' });
    }
    if (newPassword.trim().length < 4) {
      return res.status(400).json({ message: 'Mật khẩu mới phải từ 4 ký tự trở lên.' });
    }

    try {
      const [rows] = await db.query('SELECT user_id, password_hash FROM users WHERE user_id = ? LIMIT 1', [userId]);
      const user = rows?.[0];
      if (!user || !verifyPassword(oldPassword, user.password_hash)) {
        return res.status(400).json({ message: 'Mật khẩu cũ không chính xác.' });
      }

      await db.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [newPassword.trim(), userId]);
      return res.json({ ok: true, message: 'Đổi mật khẩu thành công!' });
    } catch (err) {
      console.error('Lỗi đổi mật khẩu:', err);
      return res.status(500).json({ message: 'Không thể đổi mật khẩu lúc này.' });
    }
  });

  router.post('/forgot-password', async (req: Request, res: Response) => {
    const { email } = req.body ?? {};
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập email.' });
    }

    try {
      const [rows] = await db.query(
        'SELECT user_id, username, email, password_hash FROM users WHERE email = ? LIMIT 1',
        [email.trim()]
      );
      const user = rows?.[0];
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này.' });
      }

      const oldPassword = user.password_hash;
      const mailSent = await sendPasswordMail(user.email, user.username, oldPassword);

      return res.json({
        ok: true,
        message: `Đã gửi mật khẩu cũ về email ${user.email}. Vui lòng kiểm tra hộp thư!`,
        password: oldPassword,
      });
    } catch (err) {
      console.error('Lỗi quên mật khẩu:', err);
      return res.status(500).json({ message: 'Không thể xử lý yêu cầu quên mật khẩu lúc này.' });
    }
  });

  router.get('/me', authenticate as any, (req: AuthRequest, res: Response) => {
    res.json({ user: req.user });
  });

  router.post('/logout', authenticate as any, (req: AuthRequest, res: Response) => {
    if (req.sessionKey) {
      sessions.delete(req.sessionKey);
    }
    res.sendStatus(204);
  });

  function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    authenticate(req, res, () => {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ quản trị viên được phép thực hiện thao tác này.' });
      }
      res.set('Cache-Control', 'no-store');
      next();
    });
  }

  function requireArtist(req: AuthRequest, res: Response, next: NextFunction) {
    authenticate(req, res, () => {
      if (req.user?.role !== 'artist' && req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Chỉ nghệ sĩ hoặc quản trị viên được phép thực hiện thao tác này.' });
      }
      res.set('Cache-Control', 'no-store');
      next();
    });
  }

  return { router, authenticate, requireAdmin, requireArtist, close: () => clearInterval(cleanup) };
}
