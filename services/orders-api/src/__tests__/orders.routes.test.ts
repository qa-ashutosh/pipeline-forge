import request from 'supertest';
import { createApp } from '../app';
import { UsersClient } from '../clients/users.client';

// The route module creates a singleton `const usersClient = new UsersClient()` at load time.
// Mocking the constructor won't affect that already-created instance.
// Spying on the prototype affects all instances including the singleton — correct pattern here.
jest.mock('../clients/users.client');

const app = createApp();

const defaultUser = {
  id: 'usr_001',
  name: 'Alice Nguyen',
  email: 'alice@pipeline-forge.dev',
};

let getUserSpy: jest.SpyInstance;

beforeEach(() => {
  getUserSpy = jest
    .spyOn(UsersClient.prototype, 'getUser')
    .mockResolvedValue(defaultUser);
});

afterEach(() => {
  getUserSpy.mockRestore();
});

describe('orders-api routes', () => {
  // ─── Health ───────────────────────────────────────────────────────────────

  describe('GET /api/v1/health', () => {
    it('responds 200 with service status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ service: 'orders-api', status: 'ok' });
      expect(res.body).toHaveProperty('timestamp');
    });

    it('reflects npm_package_version env var when set', async () => {
      process.env['npm_package_version'] = '1.2.3';
      const res = await request(app).get('/api/v1/health');
      expect(res.body.version).toBe('1.2.3');
      delete process.env['npm_package_version'];
    });

    it('falls back to 0.0.0 when npm_package_version is not set', async () => {
      delete process.env['npm_package_version'];
      const res = await request(app).get('/api/v1/health');
      expect(res.body.version).toBe('0.0.0');
    });
  });

  // ─── Unknown route — covers app.ts 404 fallback handler ──────────────────

  describe('unknown route', () => {
    it('responds 404 with NOT_FOUND for undefined routes', async () => {
      const res = await request(app).get('/api/v1/does-not-exist');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('NOT_FOUND');
      expect(res.body.message).toBe('Route not found');
    });
  });

  // ─── Orders list ──────────────────────────────────────────────────────────

  describe('GET /api/v1/orders', () => {
    it('responds 200 with array of orders', async () => {
      const res = await request(app).get('/api/v1/orders');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  // ─── Single order ─────────────────────────────────────────────────────────

  describe('GET /api/v1/orders/:id', () => {
    it('responds 200 with a specific order', async () => {
      const res = await request(app).get('/api/v1/orders/ord_001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('ord_001');
    });

    it('responds 404 for unknown order', async () => {
      const res = await request(app).get('/api/v1/orders/ord_999');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('NOT_FOUND');
    });
  });

  // ─── Enriched order ───────────────────────────────────────────────────────

  describe('GET /api/v1/orders/:id/enriched', () => {
    it('responds 200 with order enriched with user data', async () => {
      const res = await request(app).get('/api/v1/orders/ord_001/enriched');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.id).toBe('usr_001');
    });

    it('responds 404 when order does not exist', async () => {
      const res = await request(app).get('/api/v1/orders/ord_999/enriched');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('NOT_FOUND');
    });

    it('responds 502 when users-api returns null — covers DEPENDENCY_ERROR branch', async () => {
      // Override prototype spy for this test only — affects the singleton instance
      getUserSpy.mockResolvedValueOnce(null);

      const res = await request(app).get('/api/v1/orders/ord_001/enriched');
      expect(res.status).toBe(502);
      expect(res.body.error).toBe('DEPENDENCY_ERROR');
      expect(res.body.message).toContain('usr_001');
      expect(res.body.statusCode).toBe(502);
    });
  });

  // ─── Create order ─────────────────────────────────────────────────────────

  describe('POST /api/v1/orders', () => {
    it('responds 201 and creates an order', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .send({
          userId: 'usr_001',
          items: [{ productId: 'prod_t1', name: 'Test Item', quantity: 1, unitPrice: 19.99 }],
        });
      expect(res.status).toBe(201);
      expect(res.body.data.userId).toBe('usr_001');
      expect(res.body.data.total).toBe(19.99);
    });

    it('responds 400 when userId is missing', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .send({ items: [{ productId: 'x', name: 'X', quantity: 1, unitPrice: 1 }] });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('responds 400 when items array is empty', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .send({ userId: 'usr_001', items: [] });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });

    it('responds 400 when items key is missing entirely', async () => {
      const res = await request(app)
        .post('/api/v1/orders')
        .send({ userId: 'usr_001' });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('VALIDATION_ERROR');
    });
  });
});
