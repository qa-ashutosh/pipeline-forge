import { createApp } from './app';

const PORT = parseInt(process.env['PORT'] ?? '3001', 10);
const app = createApp();

const server = app.listen(PORT, () => {
  console.info(`[users-api] running on http://localhost:${PORT}`);
  console.info(`[users-api] environment: ${process.env['NODE_ENV'] ?? 'development'}`);
});

// Graceful shutdown
const shutdown = (signal: string): void => {
  console.info(`[users-api] ${signal} received — shutting down gracefully`);
  server.close(() => {
    console.info('[users-api] server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
