import { OrderRepository } from '../repositories/order.repository';

describe('OrderRepository', () => {
  let repo: OrderRepository;

  beforeEach(() => {
    repo = new OrderRepository();
  });

  describe('findAll()', () => {
    it('returns all seeded orders', () => {
      expect(repo.findAll()).toHaveLength(2);
    });

    it('returns orders with required fields', () => {
      repo.findAll().forEach((order) => {
        expect(order).toHaveProperty('id');
        expect(order).toHaveProperty('userId');
        expect(order).toHaveProperty('items');
        expect(order).toHaveProperty('status');
        expect(order).toHaveProperty('total');
        expect(order).toHaveProperty('createdAt');
      });
    });
  });

  describe('findById()', () => {
    it('returns correct order for valid id', () => {
      const order = repo.findById('ord_001');
      expect(order).toBeDefined();
      expect(order?.userId).toBe('usr_001');
    });

    it('returns undefined for unknown id', () => {
      expect(repo.findById('ord_999')).toBeUndefined();
    });
  });

  describe('findByUserId()', () => {
    it('returns orders belonging to a given user', () => {
      const orders = repo.findByUserId('usr_001');
      expect(orders).toHaveLength(1);
      expect(orders[0]?.id).toBe('ord_001');
    });

    it('returns empty array for user with no orders', () => {
      expect(repo.findByUserId('usr_999')).toHaveLength(0);
    });
  });

  describe('create()', () => {
    it('creates an order with correct total', () => {
      const order = repo.create({
        userId: 'usr_001',
        items: [
          { productId: 'prod_x', name: 'Widget', quantity: 2, unitPrice: 10.00 },
          { productId: 'prod_y', name: 'Gadget', quantity: 1, unitPrice: 5.50 },
        ],
      });
      expect(order.total).toBe(25.50);
      expect(order.status).toBe('pending');
      expect(order.userId).toBe('usr_001');
    });

    it('persists the created order', () => {
      const created = repo.create({
        userId: 'usr_002',
        items: [{ productId: 'prod_z', name: 'Thing', quantity: 1, unitPrice: 9.99 }],
      });
      expect(repo.findById(created.id)).toEqual(created);
    });

    it('rounds total to 2 decimal places', () => {
      const order = repo.create({
        userId: 'usr_001',
        items: [{ productId: 'prod_r', name: 'Item', quantity: 3, unitPrice: 0.10 }],
      });
      expect(order.total).toBe(0.30);
    });
  });

  describe('reset()', () => {
    it('restores seed state after mutations', () => {
      repo.create({
        userId: 'usr_003',
        items: [{ productId: 'x', name: 'X', quantity: 1, unitPrice: 1.00 }],
      });
      expect(repo.findAll()).toHaveLength(3);
      repo.reset();
      expect(repo.findAll()).toHaveLength(2);
    });
  });
});
