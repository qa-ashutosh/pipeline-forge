export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateOrderDto {
  userId: string;
  items: Omit<OrderItem, never>[];
}

// Shape of the user data this service fetches from users-api
// Matches the contract defined in Stage 02 Pact tests
export interface UserSummary {
  id: string;
  name: string;
  email: string;
}

export interface EnrichedOrder extends Order {
  user: UserSummary;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  timestamp: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}
