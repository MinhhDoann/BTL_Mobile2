import { Router, Request, Response } from 'express';
import { db } from '../config/db';
import { createAuth } from '../services/auth.service';
import { homeRouter } from './home.routes';
import { songsRouter } from './songs.routes';
import { adminRouter } from './admin.routes';
import { createAdminDataRouter } from './admin-data.routes';
import { createArtistRouter } from './artist.routes';

export function createApiRouter(customDb = db, authService = createAuth(customDb)): Router {
  const router = Router();

  // Health check endpoint
  router.get('/health', async (_req: Request, res: Response) => {
    try {
      const [rows]: [any[], any] = await customDb.query('SELECT 1 AS ok');
      res.json({ ok: true, db: rows[0]?.ok === 1 });
    } catch (error: any) {
      res.status(500).json({ ok: false, message: error.message });
    }
  });

  // Auth routes: /api/auth/*
  router.use('/api/auth', authService.router);

  // Home feeds: /api/home-data
  router.use('/api', homeRouter);

  // Song details: /api/songs/*
  router.use('/api/songs', songsRouter);

  // Artist routes: /api/artist/*
  router.use('/api/artist', authService.authenticate as any, createArtistRouter(customDb));

  // Admin routes: /api/admin/*
  router.use('/api/admin', authService.requireAdmin as any);
  router.use('/api/admin/data', createAdminDataRouter(customDb));
  router.use('/api/admin', adminRouter);

  return router;
}

export const apiRouter = createApiRouter();
