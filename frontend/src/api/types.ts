export interface Wallet {
  userId: string;
  balanceMinor: number;
  currency: 'JPY';
}

export type TransactionStatus = 'completed' | 'failed';

export interface Transaction {
  id: string;
  senderId: string;
  recipientId: string;
  amountMinor: number;
  currency: 'JPY';
  memo?: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface CreateTransferRequest {
  recipientId: string;
  amountMinor: number;
  currency: 'JPY';
  memo?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

export interface ApiErrorBody {
  statusCode: number;
  path: string;
  timestamp: string;
  message: string | string[];
}
