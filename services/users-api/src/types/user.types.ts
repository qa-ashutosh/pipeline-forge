export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  createdAt: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role?: User['role'];
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
