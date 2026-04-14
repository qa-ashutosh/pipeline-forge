import { createApp } from './app';

const PORT = parseInt(process.env['PORT'] ?? '3002', 10);
const app = createApp();

const server = app.listen(PORT, () => {
  console.info(`[orders-api] running on http://localhost:${PORT}`);
  console.info(`[orders-api] environment: ${process.env['NODE_ENV'] ?? 'development'}`);
});

const shutdown = (signal: string): void => {
  console.info(`[orders-api] ${signal} received — shutting down gracefully`);
  server.close(() => {
    console.info('[orders-api] server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
