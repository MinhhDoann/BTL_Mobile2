import express, { Express } from 'express';
import cors from 'cors';
import { apiRouter } from './routes';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use('/uploads', express.static('uploads'));

  app.use(apiRouter);

  return app;
}

export const app = createApp();
export default app;
