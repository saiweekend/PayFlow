import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { TransactionsModule } from './transactions/transactions.module';

@Module({
  imports: [
    // Global rate limit: 20 requests / 10s per IP by default, overridden
    // per-route (e.g. login is stricter — see auth.controller.ts).
    ThrottlerModule.forRoot([
      {
        ttl: 10_000,
        limit: 20,
      },
    ]),
    AuthModule,
    WalletModule,
    TransactionsModule,
  ],
  providers: [
    {
      // Applied to every route unless a controller opts out with @SkipThrottle().
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
