import { Router, type Request, type Response } from 'express';
import type { ApiResponse, ApiError } from '../types/user.types';
import { UserRepository } from '../repositories/user.repository';

const router = Router();
const repo = new UserRepository();

// ─── Health ──────────────────────────────────────────────────────────────────

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    service: 'users-api',
    status: 'ok',
    version: process.env['npm_package_version'] ?? '0.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── GET /users ───────────────────────────────────────────────────────────────

router.get('/users', (_req: Request, res: Response) => {
  const users = repo.findAll();
  const body: ApiResponse<typeof users> = {
    data: users,
    message: 'Users retrieved successfully',
    timestamp: new Date().toISOString(),
  };
  res.status(200).json(body);
});

// ─── GET /users/:id ───────────────────────────────────────────────────────────

router.get('/users/:id', (req: Request, res: Response) => {
  const user = repo.findById(req.params['id'] ?? '');

  if (!user) {
    const error: ApiError = {
      error: 'NOT_FOUND',
      message: `User with id '${req.params['id']}' not found`,
      statusCode: 404,
      timestamp: new Date().toISOString(),
    };
    res.status(404).json(error);
    return;
  }

  const body: ApiResponse<typeof user> = {
    data: user,
    message: 'User retrieved successfully',
    timestamp: new Date().toISOString(),
  };
  res.status(200).json(body);
});

// ─── POST /users ──────────────────────────────────────────────────────────────

router.post('/users', (req: Request, res: Response) => {
  const { name, email, role } = req.body as Record<string, string>;

  if (!name || !email) {
    const error: ApiError = {
      error: 'VALIDATION_ERROR',
      message: 'Fields "name" and "email" are required',
      statusCode: 400,
      timestamp: new Date().toISOString(),
    };
    res.status(400).json(error);
    return;
  }

  const validRoles = ['admin', 'member', 'viewer'] as const;
  if (role && !validRoles.includes(role as (typeof validRoles)[number])) {
    const error: ApiError = {
      error: 'VALIDATION_ERROR',
      message: `Role must be one of: ${validRoles.join(', ')}`,
      statusCode: 400,
      timestamp: new Date().toISOString(),
    };
    res.status(400).json(error);
    return;
  }

  const user = repo.create({
    name,
    email,
    role: role as 'admin' | 'member' | 'viewer' | undefined,
  });

  const body: ApiResponse<typeof user> = {
    data: user,
    message: 'User created successfully',
    timestamp: new Date().toISOString(),
  };
  res.status(201).json(body);
});

export { router, repo };
