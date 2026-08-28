import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  getBalance(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.walletService.getBalance(user.sub);
  }
}
