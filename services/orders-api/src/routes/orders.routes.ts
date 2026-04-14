import { Router, type Request, type Response } from 'express';
import type { ApiResponse, ApiError, CreateOrderDto } from '../types/order.types';
import { OrderRepository } from '../repositories/order.repository';
import { UsersClient } from '../clients/users.client';

const router = Router();
const repo = new OrderRepository();
const usersClient = new UsersClient();

// ─── Health ──────────────────────────────────────────────────────────────────

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    service: 'orders-api',
    status: 'ok',
    version: process.env['npm_package_version'] ?? '0.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── GET /orders ──────────────────────────────────────────────────────────────

router.get('/orders', (_req: Request, res: Response) => {
  const orders = repo.findAll();
  const body: ApiResponse<typeof orders> = {
    data: orders,
    message: 'Orders retrieved successfully',
    timestamp: new Date().toISOString(),
  };
  res.status(200).json(body);
});

// ─── GET /orders/:id ─────────────────────────────────────────────────────────

router.get('/orders/:id', (req: Request, res: Response) => {
  const order = repo.findById(req.params['id'] ?? '');

  if (!order) {
    const error: ApiError = {
      error: 'NOT_FOUND',
      message: `Order '${req.params['id']}' not found`,
      statusCode: 404,
      timestamp: new Date().toISOString(),
    };
    res.status(404).json(error);
    return;
  }

  const body: ApiResponse<typeof order> = {
    data: order,
    message: 'Order retrieved successfully',
    timestamp: new Date().toISOString(),
  };
  res.status(200).json(body);
});

// ─── GET /orders/:id/enriched — calls users-api ───────────────────────────────
// This endpoint is where the inter-service call happens.
// Pact contract tests in Stage 02 will mock this boundary.

router.get('/orders/:id/enriched', async (req: Request, res: Response) => {
  const order = repo.findById(req.params['id'] ?? '');

  if (!order) {
    const error: ApiError = {
      error: 'NOT_FOUND',
      message: `Order '${req.params['id']}' not found`,
      statusCode: 404,
      timestamp: new Date().toISOString(),
    };
    res.status(404).json(error);
    return;
  }

  const user = await usersClient.getUser(order.userId);

  if (!user) {
    const error: ApiError = {
      error: 'DEPENDENCY_ERROR',
      message: `User '${order.userId}' not found in users-api`,
      statusCode: 502,
      timestamp: new Date().toISOString(),
    };
    res.status(502).json(error);
    return;
  }

  const enriched = { ...order, user };
  const body: ApiResponse<typeof enriched> = {
    data: enriched,
    message: 'Enriched order retrieved successfully',
    timestamp: new Date().toISOString(),
  };
  res.status(200).json(body);
});

// ─── POST /orders ─────────────────────────────────────────────────────────────

router.post('/orders', (req: Request, res: Response) => {
  const { userId, items } = req.body as Partial<CreateOrderDto>;

  if (!userId || !items || !Array.isArray(items) || items.length === 0) {
    const error: ApiError = {
      error: 'VALIDATION_ERROR',
      message: 'Fields "userId" and "items" (non-empty array) are required',
      statusCode: 400,
      timestamp: new Date().toISOString(),
    };
    res.status(400).json(error);
    return;
  }

  const order = repo.create({ userId, items });
  const body: ApiResponse<typeof order> = {
    data: order,
    message: 'Order created successfully',
    timestamp: new Date().toISOString(),
  };
  res.status(201).json(body);
});

export { router, repo };
