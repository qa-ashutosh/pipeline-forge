import type { Order, CreateOrderDto } from '../types/order.types.js';

const SEED_ORDERS: Order[] = [
  {
    id: 'ord_001',
    userId: 'usr_001',
    status: 'delivered',
    total: 149.99,
    createdAt: '2025-02-01T10:00:00.000Z',
    items: [
      { productId: 'prod_a1', name: 'Mechanical Keyboard', quantity: 1, unitPrice: 149.99 },
    ],
  },
  {
    id: 'ord_002',
    userId: 'usr_002',
    status: 'pending',
    total: 59.98,
    createdAt: '2025-02-10T14:30:00.000Z',
    items: [
      { productId: 'prod_b2', name: 'USB-C Hub', quantity: 2, unitPrice: 29.99 },
    ],
  },
];

export class OrderRepository {
  private orders: Map<string, Order>;

  constructor(seed: Order[] = SEED_ORDERS) {
    this.orders = new Map(seed.map((o) => [o.id, o]));
  }

  findAll(): Order[] {
    return Array.from(this.orders.values());
  }

  findById(id: string): Order | undefined {
    return this.orders.get(id);
  }

  findByUserId(userId: string): Order[] {
    return Array.from(this.orders.values()).filter((o) => o.userId === userId);
  }

  create(dto: CreateOrderDto): Order {
    const id = `ord_${String(this.orders.size + 1).padStart(3, '0')}`;
    const total = dto.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    const order: Order = {
      id,
      userId: dto.userId,
      items: dto.items,
      status: 'pending',
      total: Math.round(total * 100) / 100,
      createdAt: new Date().toISOString(),
    };

    this.orders.set(id, order);
    return order;
  }

  reset(): void {
    this.orders = new Map(SEED_ORDERS.map((o) => [o.id, o]));
  }
}
