import express, { type Application, type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { router } from './routes/users.routes';

export function createApp(): Application {
  const app = express();

  // ─── Security middleware ────────────────────────────────────────────────────
  app.use(helmet());
  app.use(
    cors({
      origin: process.env['CORS_ORIGIN'] ?? '*',
      methods: ['GET', 'POST'],
    }),
  );

  // ─── Request parsing ────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10kb' }));

  // ─── Logging ────────────────────────────────────────────────────────────────
  if (process.env['NODE_ENV'] !== 'test') {
    app.use(morgan('combined'));
  }

  // ─── Routes ─────────────────────────────────────────────────────────────────
  app.use('/api/v1', router);

  // ─── 404 handler ────────────────────────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: 'NOT_FOUND',
      message: 'Route not found',
      statusCode: 404,
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
