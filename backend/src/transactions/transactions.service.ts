import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { WalletService } from '../wallet/wallet.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  private readonly transactions: Transaction[] = [];

  constructor(private readonly walletService: WalletService) {}

  listForUser(userId: string): Transaction[] {
    return this.transactions
      .filter((t) => t.senderId === userId || t.recipientId === userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  /**
   * Executes a P2P transfer.
   *
   * This method is deliberately the *only* place that touches both wallets
   * for a transfer, and it validates funds immediately before debiting, so
   * there's no window where a transaction record exists without the balance
   * change (or vice versa). In a real system this would be a single DB
   * transaction (`BEGIN … COMMIT`) around the two ledger postings; here the
   * in-memory Map mutations are synchronous, which gives us the same
   * effective atomicity for the demo — Node's single-threaded event loop
   * means no other request can interleave between the debit and credit
   * calls below.
   */
  transfer(senderId: string, dto: CreateTransferDto): Transaction {
    if (dto.recipientId === senderId) {
      throw new BadRequestException('Cannot send money to yourself.');
    }

    if (!this.walletService.hasSufficientFunds(senderId, dto.amountMinor)) {
      throw new UnprocessableEntityException('Insufficient funds.');
    }

    // Throws NotFoundException if the recipient doesn't exist — surfaces as
    // a 404 via the same global exception filter, no special-casing needed.
    this.walletService.getBalance(dto.recipientId);

    this.walletService.debit(senderId, dto.amountMinor);
    this.walletService.credit(dto.recipientId, dto.amountMinor);

    const transaction: Transaction = {
      id: uuid(),
      senderId,
      recipientId: dto.recipientId,
      amountMinor: dto.amountMinor,
      currency: dto.currency,
      memo: dto.memo,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    this.transactions.push(transaction);
    return transaction;
  }
}
