import type { UserSummary } from '../types/order.types';

// This class is the exact boundary where Pact contract tests will be written in Stage 02.
// It defines what orders-api *expects* from users-api — which becomes the Pact contract.
export class UsersClient {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? process.env['USERS_API_URL'] ?? 'http://localhost:3001';
  }

  async getUser(userId: string): Promise<UserSummary | null> {
    const url = `${this.baseUrl}/api/v1/users/${userId}`;

    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`users-api responded ${response.status} for user ${userId}`);
    }

    const body = (await response.json()) as { data: UserSummary };
    return body.data;
  }
}
