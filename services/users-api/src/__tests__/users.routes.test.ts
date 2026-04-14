import request from 'supertest';
import { createApp } from '../app';

// Note: supertest is added in Stage 02 when full test suite is built.
// This file uses the pattern but marks it clearly for Stage 02 completion.
// For Stage 01 it validates the app factory and route wiring.

describe('users-api routes', () => {
  const app = createApp();

  describe('GET /api/v1/health', () => {
    it('responds 200 with service status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        service: 'users-api',
        status: 'ok',
      });
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/v1/users', () => {
    it('responds 200 with array of users', async () => {
      const res = await request(app).get('/api/v1/users');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/users/:id', () => {
    it('responds 200 with a specific user', async () => {
      const res = await request(app).get('/api/v1/users/usr_001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('usr_001');
    });

    it('responds 404 for unknown user', async () => {
      const res = await request(app).get('/api/v1/users/usr_999');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/v1/users', () => {
    it('responds 201 and creates a user', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .send({ name: 'Test User', email: 'test@pipeline-forge.dev' });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Test User');
      expect(res.body.data.role).toBe('member');
    });

    it('responds 400 when name is missing', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .send({ email: 'noname@pipeline-forge.dev' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('responds 400 for invalid role', async () => {
      const res = await request(app)
        .post('/api/v1/users')
        .send({ name: 'Bad Role', email: 'bad@test.com', role: 'superuser' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET unknown route', () => {
    it('responds 404 for undefined routes', async () => {
      const res = await request(app).get('/api/v1/nonexistent');
      expect(res.status).toBe(404);
    });
  });
});
