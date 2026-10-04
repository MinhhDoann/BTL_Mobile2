import { Router, Request, Response } from 'express';
import { db } from '../config/db';
import { createAuth } from '../services/auth.service';
import { homeRouter } from './home.routes';
import { playlistRouter } from './playlist.routes';
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
  router.use('/api', playlistRouter);

  // Ad interactions (public)
  router.post('/api/artist/:artistId/ad-interaction', async (req: Request, res: Response) => {
    try {
      const artistId = Number(req.params.artistId);
      const { type } = req.body; // 'view' hoc 'click'

      if (!artistId || !Number.isFinite(artistId)) {
        return res.status(400).json({ message: "artistId khong hop le." });
      }

      if (type === 'view') {
        // banner_views dduowc count rieng
      } else if (type === 'click') {
        await customDb.query('UPDATE artists SET banner_clicks = banner_clicks + 1 WHERE artist_id = ?', [artistId]);
      } else {
        return res.status(400).json({ message: "Loi tng tAc khong hop le (view/click)." });
      }

      return res.json({ ok: true, message: "Ghi nhan tuong tac thanh cong." });
    } catch (error: any) {
      console.error('L-i ghi nh-n tng tAc banner QC:', error);
      return res.status(500).json({ message: "Loi server." });
    }
  });

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
