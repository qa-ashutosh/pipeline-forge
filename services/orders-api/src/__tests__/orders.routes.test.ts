import request from 'supertest';
import { createApp } from '../app';

// UsersClient is mocked so route tests have no external dependency
jest.mock('../clients/users.client', () => ({
  UsersClient: jest.fn().mockImplementation(() => ({
    getUser: jest.fn().mockResolvedValue({
      id: 'usr_001',
      name: 'Alice Nguyen',
      email: 'alice@pipeline-forge.dev',
    }),
  })),
}));

describe('orders-api routes', () => {
  const app = createApp();

  describe('GET /api/v1/health', () => {
    it('responds 200 with service status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({ service: 'orders-api', status: 'ok' });
    });
  });

  describe('GET /api/v1/orders', () => {
    it('responds 200 with array of orders', async () => {
      const res = await request(app).get('/api/v1/orders');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

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
    });
  });

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
    });
  });
});
