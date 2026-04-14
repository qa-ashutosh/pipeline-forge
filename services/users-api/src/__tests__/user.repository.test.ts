import { UserRepository } from '../repositories/user.repository';

describe('UserRepository', () => {
  let repo: UserRepository;

  beforeEach(() => {
    repo = new UserRepository();
  });

  describe('findAll()', () => {
    it('returns all seeded users', () => {
      const users = repo.findAll();
      expect(users).toHaveLength(3);
    });

    it('returns users with required fields', () => {
      const users = repo.findAll();
      users.forEach((user) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('createdAt');
      });
    });
  });

  describe('findById()', () => {
    it('returns the correct user for a valid id', () => {
      const user = repo.findById('usr_001');
      expect(user).toBeDefined();
      expect(user?.id).toBe('usr_001');
      expect(user?.name).toBe('Alice Nguyen');
    });

    it('returns undefined for an unknown id', () => {
      const user = repo.findById('usr_999');
      expect(user).toBeUndefined();
    });
  });

  describe('create()', () => {
    it('creates a user with required fields', () => {
      const user = repo.create({ name: 'Dave Test', email: 'dave@test.com' });
      expect(user.id).toBeDefined();
      expect(user.name).toBe('Dave Test');
      expect(user.email).toBe('dave@test.com');
      expect(user.role).toBe('member'); // default role
    });

    it('creates a user with a specified role', () => {
      const user = repo.create({ name: 'Eve Admin', email: 'eve@test.com', role: 'admin' });
      expect(user.role).toBe('admin');
    });

    it('persists the created user', () => {
      const created = repo.create({ name: 'Frank New', email: 'frank@test.com' });
      const found = repo.findById(created.id);
      expect(found).toEqual(created);
    });
  });

  describe('exists()', () => {
    it('returns true for seeded user ids', () => {
      expect(repo.exists('usr_001')).toBe(true);
      expect(repo.exists('usr_002')).toBe(true);
    });

    it('returns false for unknown ids', () => {
      expect(repo.exists('usr_999')).toBe(false);
    });
  });

  describe('reset()', () => {
    it('restores the original seed state after mutations', () => {
      repo.create({ name: 'Temp User', email: 'temp@test.com' });
      expect(repo.findAll()).toHaveLength(4);

      repo.reset();
      expect(repo.findAll()).toHaveLength(3);
    });
  });
});
