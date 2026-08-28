import { describe, expect, it } from 'vitest';
import { validateTransfer } from '@/utils/validation';

const base = {
  recipientId: 'usr_2',
  amountMinor: 500,
  senderBalanceMinor: 10_000,
  senderId: 'usr_1',
};

describe('validateTransfer', () => {
  it('accepts a valid transfer', () => {
    expect(validateTransfer(base).valid).toBe(true);
  });

  it('rejects sending to yourself', () => {
    const result = validateTransfer({ ...base, recipientId: 'usr_1' });
    expect(result.valid).toBe(false);
    expect(result.errors.recipientId).toMatch(/yourself/);
  });

  it('rejects an empty recipient', () => {
    const result = validateTransfer({ ...base, recipientId: '  ' });
    expect(result.valid).toBe(false);
    expect(result.errors.recipientId).toBeDefined();
  });

  it('rejects a null amount', () => {
    const result = validateTransfer({ ...base, amountMinor: null });
    expect(result.valid).toBe(false);
    expect(result.errors.amountMinor).toBeDefined();
  });

  it('rejects an amount over the sender balance', () => {
    const result = validateTransfer({ ...base, amountMinor: 20_000 });
    expect(result.valid).toBe(false);
    expect(result.errors.amountMinor).toMatch(/insufficient/i);
  });

  it('rejects an amount over the per-transfer cap even with enough balance', () => {
    const result = validateTransfer({
      ...base,
      amountMinor: 2_000_000,
      senderBalanceMinor: 5_000_000,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.amountMinor).toMatch(/limit/);
  });

  it('rejects a memo over 140 characters', () => {
    const result = validateTransfer({ ...base, memo: 'a'.repeat(141) });
    expect(result.valid).toBe(false);
    expect(result.errors.memo).toBeDefined();
  });
});
