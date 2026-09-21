import express, { NextFunction, Response, Router } from 'express';
import { AuthRequest } from '../types/auth.types';
import { EntityConfig, EntityName } from '../types/admin.types';
import {
  deletionPreview,
  entities,
  fail,
  integer,
  lockUsers,
  normalize,
  protectAdmin,
  selectFields,
  text,
  transaction,
  validateReferences,
} from '../services/admin-data.service';

export interface AdminDataRequest extends AuthRequest {
  entityConfig?: EntityConfig;
  params: {
    entity?: string;
    id?: string;
    [key: string]: any;
  };
}

export function createAdminDataRouter(db: any): Router {
  const router = express.Router();

  router.use((req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ message: 'Vui lòng đăng nhập.' });
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Chỉ quản trị viên được truy cập.' });
    res.set('Cache-Control', 'no-store');
    next();
  });

  router.param('entity', (req: AdminDataRequest, res: Response, next: NextFunction, name: string) => {
    if (!Object.hasOwn(entities, name)) return res.status(404).json({ message: 'Mục quản lý không tồn tại.' });
    req.entityConfig = entities[name as EntityName];
    next();
  });

  router.get('/:entity', async (req: AdminDataRequest, res: Response) => {
    const entity = req.params.entity!;
    const config = req.entityConfig!;
    const page = integer(req.query.page ?? '1', 'Trang')!;
    const pageSize = Math.min(integer(req.query.pageSize ?? '20', 'Số dòng')!, 100);
    const query = text(req.query.q, 'tìm kiếm', 100) || '';
    const where = query ? `WHERE (${config.search.map((field) => `${field} LIKE ?`).join(' OR ')})` : '';
    const args = query ? config.search.map(() => `%${query.replace(/[\\%_]/g, '\\$&')}%`) : [];
    const from = `FROM ${entity} t ${config.joins} ${where}`;

    const [counts] = await db.query(`SELECT COUNT(*) AS total ${from}`, args);
    const total = Number(counts[0].total);
    const actualPage = Math.min(page, Math.max(1, Math.ceil(total / pageSize)));
    const fields = selectFields(config, 't.');

    const [rows] = await db.query(
      `SELECT ${fields}${config.extra} ${from} ORDER BY t.${config.id} DESC LIMIT ? OFFSET ?`,
      [...args, pageSize, (actualPage - 1) * pageSize]
    );

    res.json({ items: rows, page: actualPage, pageSize, total });
  });

  router.get('/:entity/:id', async (req: AdminDataRequest, res: Response) => {
    const entity = req.params.entity!;
    const config = req.entityConfig!;
    const id = integer(req.params.id, 'ID')!;

    const [rows] = await db.query(`SELECT ${selectFields(config)} FROM ${entity} WHERE ${config.id} = ?`, [id]);
    if (!rows.length) fail(404, 'Bản ghi không còn tồn tại.');

    if (entity === 'songs') {
      const [genres] = await db.query('SELECT genre_id FROM song_genres WHERE song_id = ?', [id]);
      rows[0].genres = genres.map((genre: any) => genre.genre_id);
    }

    res.json(rows[0]);
  });

  router.post('/:entity', async (req: AdminDataRequest, res: Response) => {
    const entity = req.params.entity!;
    const data = normalize(entity, req.body, true);

    const id = await transaction(db, async (connection) => {
      if (entity === 'users') await lockUsers(connection, req.user!.user_id);
      await validateReferences(connection, entity, data);
      const { genres, ...fields } = data;
      const [result] = await connection.query(`INSERT INTO ${entity} SET ?`, [fields]);
      if (genres?.length) {
        await connection.query('INSERT INTO song_genres (song_id, genre_id) VALUES ?', [
          genres.map((genre: number) => [result.insertId, genre]),
        ]);
      }
      return result.insertId;
    });

    res.status(201).json({ id, message: 'Đã thêm dữ liệu.' });
  });

  router.put('/:entity/:id', async (req: AdminDataRequest, res: Response) => {
    const entity = req.params.entity!;
    const id = integer(req.params.id, 'ID')!;
    const data = normalize(entity, req.body, false);

    await transaction(db, async (connection) => {
      if (entity === 'users') {
        protectAdmin(await lockUsers(connection, req.user!.user_id), id, req.user!.user_id, false, data.role);
      }
      const [rows] = await connection.query(
        `SELECT ${req.entityConfig!.id} FROM ${entity} WHERE ${req.entityConfig!.id} = ? FOR UPDATE`,
        [id]
      );
      if (!rows.length) fail(404, 'Bản ghi không còn tồn tại.');
      await validateReferences(connection, entity, data);
      const { genres, ...fields } = data;
      await connection.query(`UPDATE ${entity} SET ? WHERE ${req.entityConfig!.id} = ?`, [fields, id]);
      if (genres) {
        await connection.query('DELETE FROM song_genres WHERE song_id = ?', [id]);
        if (genres.length) {
          await connection.query('INSERT INTO song_genres (song_id, genre_id) VALUES ?', [
            genres.map((genre: number) => [id, genre]),
          ]);
        }
      }
    });

    res.json({ message: 'Đã lưu thay đổi.' });
  });

  router.get('/:entity/:id/delete-preview', async (req: AdminDataRequest, res: Response) => {
    const id = integer(req.params.id, 'ID')!;
    const entity = req.params.entity!;

    const result = await transaction(db, async (connection) => {
      if (entity === 'users') {
        protectAdmin(await lockUsers(connection, req.user!.user_id), id, req.user!.user_id, true);
      }
      const [rows] = await connection.query(
        `SELECT ${req.entityConfig!.id}, ${req.entityConfig!.label} FROM ${entity} WHERE ${req.entityConfig!.id} = ? FOR UPDATE`,
        [id]
      );
      if (!rows.length) fail(404, 'Bản ghi không còn tồn tại.');
      return deletionPreview(connection, entity, id, rows[0]);
    });

    res.json(result);
  });

  router.delete('/:entity/:id', async (req: AdminDataRequest, res: Response) => {
    const id = integer(req.params.id, 'ID')!;
    const entity = req.params.entity!;

    if (typeof req.body?.confirmation !== 'string') {
      fail(400, 'Vui lòng xem và xác nhận dữ liệu sẽ bị xóa.');
    }

    await transaction(db, async (connection) => {
      if (entity === 'users') {
        protectAdmin(await lockUsers(connection, req.user!.user_id), id, req.user!.user_id, true);
      }
      const [rows] = await connection.query(
        `SELECT ${req.entityConfig!.id}, ${req.entityConfig!.label} FROM ${entity} WHERE ${req.entityConfig!.id} = ? FOR UPDATE`,
        [id]
      );
      if (!rows.length) fail(404, 'Bản ghi không còn tồn tại.');
      const preview = await deletionPreview(connection, entity, id, rows[0]);
      if (req.body.confirmation !== preview.confirmation) {
        fail(409, 'Dữ liệu liên quan đã thay đổi. Hãy hủy và mở lại xác nhận xóa.');
      }
      await connection.query(`DELETE FROM ${entity} WHERE ${req.entityConfig!.id} = ?`, [id]);
    });

    res.json({ message: 'Đã xóa dữ liệu.' });
  });

  router.use((error: any, _req: any, res: Response, _next: NextFunction) => {
    const status =
      error.status ||
      (error.code === 'ER_DUP_ENTRY' || error.code === 'ER_LOCK_DEADLOCK'
        ? 409
        : error.code === 'ER_NO_REFERENCED_ROW_2'
        ? 400
        : 500);

    res.status(status).json({
      message: error.status
        ? error.message
        : error.code === 'ER_DUP_ENTRY'
        ? 'Email hoặc tên thể loại đã tồn tại.'
        : status === 409
        ? 'Dữ liệu đang được cập nhật. Vui lòng thử lại.'
        : status === 400
        ? 'Bản ghi liên quan không còn tồn tại.'
        : 'Không thể xử lý dữ liệu. Vui lòng thử lại.',
    });
  });

  return router;
}
