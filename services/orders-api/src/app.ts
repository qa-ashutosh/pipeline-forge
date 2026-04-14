import express, { type Application, type Request, type Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { router } from './routes/orders.routes';

export function createApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env['CORS_ORIGIN'] ?? '*',
      methods: ['GET', 'POST'],
    }),
  );
  app.use(express.json({ limit: '10kb' }));

  if (process.env['NODE_ENV'] !== 'test') {
    app.use(morgan('combined'));
  }

  app.use('/api/v1', router);

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
