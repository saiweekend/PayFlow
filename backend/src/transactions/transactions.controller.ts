import { Body, Controller, Get, Post, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { IdempotencyInterceptor } from '../common/idempotency/idempotency.interceptor';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { TransactionsService } from './transactions.service';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  list(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.transactionsService.listForUser(user.sub);
  }

  @Post('transfer')
  // Every money-moving write goes through the idempotency interceptor.
  // Reads (the GET above) intentionally don't — idempotency keys only make
  // sense for operations with a side effect.
  @UseInterceptors(IdempotencyInterceptor)
  transfer(@Req() req: Request, @Body() dto: CreateTransferDto) {
    const user = req.user as JwtPayload;
    return this.transactionsService.transfer(user.sub, dto);
  }
}
