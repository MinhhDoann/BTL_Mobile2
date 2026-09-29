import { createHash, randomBytes } from 'node:crypto';
import express, { NextFunction, Request, Response, Router } from 'express';
import { AuthRequest, LoginAttempt, PublicUser, Session, User } from '../types/auth.types';

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
      let user: any;
      try {
        const [rows]: [any[], any] = await db.query(
          'SELECT user_id, username, email, role, password_hash, artist_request_status FROM users WHERE email = ? LIMIT 1',
          [email.trim()]
        );
        user = rows?.[0];
      } catch {
        const [rows]: [any[], any] = await db.query(
          'SELECT user_id, username, email, role, password_hash FROM users WHERE email = ? LIMIT 1',
          [email.trim()]
        );
        user = rows?.[0];
      }

      const valid = verifyPassword(password, user?.password_hash);
      if (!user || !valid) {
        return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
      }

      const token = randomBytes(32).toString('hex');
      sessions.set(tokenKey(token), { userId: user.user_id, expires: now() + SESSION_TTL });
      res.json({ token, user: publicUser(user) });
    } catch (err: any) {
      console.error('Lỗi đăng nhập:', err);
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
      } catch (e1: any) {
        try {
          const [insertRes] = await db.query(
            'INSERT INTO users (username, email, password_hash, role, avatar_url) VALUES (?, ?, ?, ?, ?)',
            [username.trim(), email.trim(), password, insertRole, avatar_url || null]
          );
          result = insertRes;
        } catch (e2: any) {
          const [insertRes] = await db.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [username.trim(), email.trim(), password, insertRole]
          );
          result = insertRes;
        }
      }

      const userId = result.insertId;

      if (isRequestingArtist) {
        const { bio, address } = req.body ?? {};
        const fullBio = (address ? `Địa chỉ: ${address}\n\n` : '') + (bio || 'Chưa có tiểu sử.');
        const name = username.trim();
        const avatar = avatar_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400';
        try {
          await db.query(
            'INSERT INTO artists (name, bio, avatar_url, user_id) VALUES (?, ?, ?, ?)',
            [name, fullBio, avatar, userId]
          );
        } catch (e) {
          console.warn('Không thể thêm bản ghi artist:', e);
        }
      }

      const user = { user_id: userId, username: username.trim(), email: email.trim(), role: insertRole, artist_request_status: requestStatus };
      const token = randomBytes(32).toString('hex');
      sessions.set(tokenKey(token), { userId: user.user_id, expires: now() + SESSION_TTL });
      res.json({ token, user: publicUser(user as any) });
    } catch (err: any) {
      console.error('Lỗi đăng ký:', err);
      res.status(503).json({ message: 'Không thể đăng ký lúc này.' });
    }
  });

  router.get('/me', authenticate as any, (req: AuthRequest, res: Response) => {
    res.json({ user: req.user });
  });

  router.post('/logout', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '');
      sessions.delete(tokenKey(token));
    }
    res.json({ message: 'Đăng xuất thành công.' });
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
