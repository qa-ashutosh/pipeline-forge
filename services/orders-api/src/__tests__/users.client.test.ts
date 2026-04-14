import { UsersClient } from '../clients/users.client';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('UsersClient', () => {
  let client: UsersClient;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new UsersClient('http://localhost:3001');
  });

  describe('constructor', () => {
    it('uses provided baseUrl', () => {
      const c = new UsersClient('http://custom:9000');
      expect(c).toBeInstanceOf(UsersClient);
    });

    it('falls back to USERS_API_URL env var when no baseUrl passed', () => {
      process.env['USERS_API_URL'] = 'http://env-host:3001';
      const c = new UsersClient();
      expect(c).toBeInstanceOf(UsersClient);
      delete process.env['USERS_API_URL'];
    });

    it('falls back to localhost:3001 when neither baseUrl nor env var is set', () => {
      delete process.env['USERS_API_URL'];
      const c = new UsersClient();
      expect(c).toBeInstanceOf(UsersClient);
    });
  });

  describe('getUser()', () => {
    it('returns a UserSummary when users-api responds 200', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: { id: 'usr_001', name: 'Alice Nguyen', email: 'alice@pipeline-forge.dev' },
        }),
      });

      const user = await client.getUser('usr_001');
      expect(user).not.toBeNull();
      expect(user?.id).toBe('usr_001');
      expect(user?.name).toBe('Alice Nguyen');
      expect(user?.email).toBe('alice@pipeline-forge.dev');
    });

    it('returns null when users-api responds 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const user = await client.getUser('usr_999');
      expect(user).toBeNull();
    });

    it('throws an error when users-api responds with a 5xx status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
      });

      await expect(client.getUser('usr_001')).rejects.toThrow(
        'users-api responded 503 for user usr_001',
      );
    });

    it('calls the correct endpoint URL with JSON content type', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          data: { id: 'usr_001', name: 'Alice', email: 'alice@test.com' },
        }),
      });

      await client.getUser('usr_001');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/v1/users/usr_001',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });
  });
});
