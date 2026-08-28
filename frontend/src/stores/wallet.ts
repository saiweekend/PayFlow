import { defineStore } from 'pinia';
import { api } from '@/api/client';
import type { Wallet } from '@/api/types';

interface WalletState {
  wallet: Wallet | null;
  loading: boolean;
  error: string | null;
}

export const useWalletStore = defineStore('wallet', {
  state: (): WalletState => ({
    wallet: null,
    loading: false,
    error: null,
  }),

  getters: {
    balanceMinor: (state): number => state.wallet?.balanceMinor ?? 0,
  },

  actions: {
    async fetchBalance(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.wallet = await api.getBalance();
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to load balance.';
      } finally {
        this.loading = false;
      }
    },

    /** Optimistic local update so the balance card reflects a transfer immediately. */
    applyLocalDebit(amountMinor: number): void {
      if (this.wallet) this.wallet.balanceMinor -= amountMinor;
    },
  },
});
