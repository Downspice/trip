import { Module } from '@nestjs/common';
import { FinancesController } from './finances.controller';
import { FinancesService } from './finances.service';
import { PaystackService } from '../payments/paystack.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [FinancesController],
  providers: [FinancesService, PaystackService],
})
export class FinancesModule {}
