import { defineStore } from 'pinia';
import { api, ApiError } from '@/api/client';
import type { CreateTransferRequest, Transaction } from '@/api/types';
import { useWalletStore } from './wallet';

interface TransactionsState {
  history: Transaction[];
  loading: boolean;
  sendState: 'idle' | 'sending' | 'success' | 'error';
  sendError: string | null;
  /** Generated once when the user opens the confirm step; reused across retries. */
  pendingIdempotencyKey: string | null;
}

export const useTransactionsStore = defineStore('transactions', {
  state: (): TransactionsState => ({
    history: [],
    loading: false,
    sendState: 'idle',
    sendError: null,
    pendingIdempotencyKey: null,
  }),

  actions: {
    async fetchHistory(): Promise<void> {
      this.loading = true;
      try {
        this.history = await api.listTransactions();
      } finally {
        this.loading = false;
      }
    },

    /** Call when the user reaches the confirmation screen, before they tap "Send". */
    beginTransferAttempt(): void {
      this.pendingIdempotencyKey = crypto.randomUUID();
      this.sendState = 'idle';
      this.sendError = null;
    },

    /**
     * Submits the transfer using the key from `beginTransferAttempt`. If the
     * user's network drops after the server processed the request but
     * before the response arrived, calling this again (e.g. via a "Retry"
     * button) reuses the SAME key — the backend's idempotency interceptor
     * then replays the original result instead of moving the money twice.
     */
    async submitTransfer(payload: CreateTransferRequest): Promise<Transaction> {
      if (!this.pendingIdempotencyKey) {
        // Defensive: callers should always go through beginTransferAttempt first.
        this.pendingIdempotencyKey = crypto.randomUUID();
      }

      this.sendState = 'sending';
      this.sendError = null;

      try {
        const transaction = await api.transfer(payload, this.pendingIdempotencyKey);
        this.history.unshift(transaction);
        useWalletStore().applyLocalDebit(transaction.amountMinor);
        this.sendState = 'success';
        this.pendingIdempotencyKey = null; // attempt is resolved; next send gets a fresh key
        return transaction;
      } catch (err) {
        this.sendState = 'error';
        this.sendError = err instanceof ApiError ? err.message : 'Something went wrong.';
        throw err;
      }
    },
  },
});
