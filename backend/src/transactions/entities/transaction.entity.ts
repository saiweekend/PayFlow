export type TransactionStatus = 'completed' | 'failed';

export interface Transaction {
  id: string;
  senderId: string;
  recipientId: string;
  amountMinor: number;
  currency: 'JPY';
  memo?: string;
  status: TransactionStatus;
  createdAt: string; // ISO 8601
}
