import { Test } from '@nestjs/testing';
import { BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { TransactionsService } from '../src/transactions/transactions.service';
import { WalletService } from '../src/wallet/wallet.service';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let wallet: WalletService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TransactionsService, WalletService],
    }).compile();

    service = module.get(TransactionsService);
    wallet = module.get(WalletService);
  });

  it('moves funds from sender to recipient and records a completed transaction', () => {
    const before = wallet.getBalance('usr_1').balanceMinor;
    const recipientBefore = wallet.getBalance('usr_2').balanceMinor;

    const tx = service.transfer('usr_1', {
      recipientId: 'usr_2',
      amountMinor: 1_000,
      currency: 'JPY',
    });

    expect(tx.status).toBe('completed');
    expect(wallet.getBalance('usr_1').balanceMinor).toBe(before - 1_000);
    expect(wallet.getBalance('usr_2').balanceMinor).toBe(recipientBefore + 1_000);
  });

  it('rejects a transfer to yourself', () => {
    expect(() =>
      service.transfer('usr_1', { recipientId: 'usr_1', amountMinor: 100, currency: 'JPY' }),
    ).toThrow(BadRequestException);
  });

  it('rejects a transfer that exceeds the sender balance', () => {
    expect(() =>
      service.transfer('usr_2', {
        recipientId: 'usr_1',
        amountMinor: 999_999,
        currency: 'JPY',
      }),
    ).toThrow(UnprocessableEntityException);
  });

  it('never mutates balances when the transfer is rejected', () => {
    const before = wallet.getBalance('usr_2').balanceMinor;
    try {
      service.transfer('usr_2', { recipientId: 'usr_1', amountMinor: 999_999, currency: 'JPY' });
    } catch {
      /* expected */
    }
    expect(wallet.getBalance('usr_2').balanceMinor).toBe(before);
  });

  it('lists transactions for a user in newest-first order', () => {
    service.transfer('usr_1', { recipientId: 'usr_2', amountMinor: 100, currency: 'JPY' });
    service.transfer('usr_1', { recipientId: 'usr_2', amountMinor: 200, currency: 'JPY' });

    const history = service.listForUser('usr_1');
    expect(history).toHaveLength(2);
    expect(history[0].amountMinor).toBe(200);
    expect(history[1].amountMinor).toBe(100);
  });
});
