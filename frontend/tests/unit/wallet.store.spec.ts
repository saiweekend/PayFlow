import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useWalletStore } from '@/stores/wallet';

vi.mock('@/api/client', () => ({
  api: {
    getBalance: vi.fn(),
  },
}));

import { api } from '@/api/client';

describe('useWalletStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('starts with a zero balance and no error', () => {
    const store = useWalletStore();
    expect(store.balanceMinor).toBe(0);
    expect(store.error).toBeNull();
  });

  it('fetchBalance populates the wallet on success', async () => {
    vi.mocked(api.getBalance).mockResolvedValue({
      userId: 'usr_1',
      balanceMinor: 50_000,
      currency: 'JPY',
    });

    const store = useWalletStore();
    await store.fetchBalance();

    expect(store.balanceMinor).toBe(50_000);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('fetchBalance records an error message on failure', async () => {
    vi.mocked(api.getBalance).mockRejectedValue(new Error('network down'));

    const store = useWalletStore();
    await store.fetchBalance();

    expect(store.error).toBe('network down');
    expect(store.loading).toBe(false);
  });

  it('applyLocalDebit reduces the balance optimistically', async () => {
    vi.mocked(api.getBalance).mockResolvedValue({
      userId: 'usr_1',
      balanceMinor: 10_000,
      currency: 'JPY',
    });

    const store = useWalletStore();
    await store.fetchBalance();
    store.applyLocalDebit(1_500);

    expect(store.balanceMinor).toBe(8_500);
  });
});
