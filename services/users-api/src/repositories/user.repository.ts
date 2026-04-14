import type { User, CreateUserDto } from '../types/user.types.js';

// Seed data — stable IDs so contract tests are deterministic
const SEED_USERS: User[] = [
  {
    id: 'usr_001',
    name: 'Alice Nguyen',
    email: 'alice@pipeline-forge.dev',
    role: 'admin',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'usr_002',
    name: 'Bob Okafor',
    email: 'bob@pipeline-forge.dev',
    role: 'member',
    createdAt: '2025-01-02T00:00:00.000Z',
  },
  {
    id: 'usr_003',
    name: 'Carol Smith',
    email: 'carol@pipeline-forge.dev',
    role: 'viewer',
    createdAt: '2025-01-03T00:00:00.000Z',
  },
];

export class UserRepository {
  private users: Map<string, User>;

  constructor(seed: User[] = SEED_USERS) {
    this.users = new Map(seed.map((u) => [u.id, u]));
  }

  findAll(): User[] {
    return Array.from(this.users.values());
  }

  findById(id: string): User | undefined {
    return this.users.get(id);
  }

  create(dto: CreateUserDto): User {
    const id = `usr_${String(this.users.size + 1).padStart(3, '0')}`;
    const user: User = {
      id,
      name: dto.name,
      email: dto.email,
      role: dto.role ?? 'member',
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, user);
    return user;
  }

  exists(id: string): boolean {
    return this.users.has(id);
  }

  // For testing — reset to seed state
  reset(): void {
    this.users = new Map(SEED_USERS.map((u) => [u.id, u]));
  }
}
