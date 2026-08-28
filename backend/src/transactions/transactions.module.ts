import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { IdempotencyStore } from '../common/idempotency/idempotency.store';

@Module({
  imports: [AuthModule, WalletModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, IdempotencyStore],
})
export class TransactionsModule {}
