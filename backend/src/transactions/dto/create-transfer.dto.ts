import { IsIn, IsInt, IsOptional, IsString, Max, Min, MaxLength } from 'class-validator';

export class CreateTransferDto {
  @IsString()
  recipientId!: string;

  // Amount travels as an integer in the smallest currency unit (yen) so the
  // API never has to reason about floating-point rounding on money — the
  // classic 0.1 + 0.2 !== 0.3 bug is not a risk we can afford here.
  @IsInt()
  @Min(1)
  @Max(1_000_000) // JPY 1,000,000 per-transfer cap for this demo
  amountMinor!: number;

  @IsIn(['JPY'])
  currency!: 'JPY';

  @IsOptional()
  @IsString()
  @MaxLength(140)
  memo?: string;
}
