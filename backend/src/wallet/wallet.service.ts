import { Injectable, NotFoundException } from '@nestjs/common';

export interface Wallet {
  userId: string;
  /** Stored in the smallest currency unit (yen has no subunit, so this is just yen). */
  balanceMinor: number;
  currency: 'JPY';
}

/**
 * In-memory wallet ledger for the demo. Balance mutations go through
 * `debit`/`credit` only — never a direct setter — so every change is a
 * single auditable operation, which mirrors how a real ledger service
 * forces all writes through double-entry postings rather than ad-hoc
 * balance edits.
 */
@Injectable()
export class WalletService {
  private readonly wallets = new Map<string, Wallet>([
    ['usr_1', { userId: 'usr_1', balanceMinor: 50_000, currency: 'JPY' }],
    ['usr_2', { userId: 'usr_2', balanceMinor: 12_300, currency: 'JPY' }],
  ]);

  getBalance(userId: string): Wallet {
    const wallet = this.wallets.get(userId);
    if (!wallet) throw new NotFoundException('Wallet not found.');
    return wallet;
  }

  hasSufficientFunds(userId: string, amountMinor: number): boolean {
    return this.getBalance(userId).balanceMinor >= amountMinor;
  }

  debit(userId: string, amountMinor: number): void {
    const wallet = this.getBalance(userId);
    wallet.balanceMinor -= amountMinor;
  }

  credit(userId: string, amountMinor: number): void {
    const wallet = this.getBalance(userId);
    wallet.balanceMinor += amountMinor;
  }
}
