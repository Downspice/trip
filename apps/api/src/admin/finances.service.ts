import { Injectable } from '@nestjs/common';
import { PaystackService } from '../payments/paystack.service';
import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';

export class WithdrawDto {
  @IsString() @IsNotEmpty() accountName: string;
  @IsString() @IsNotEmpty() accountNumber: string;
  @IsString() @IsNotEmpty() bankCode: string;
  @IsNumber() @IsPositive() amount: number; // in GHS (not kobo)
  @IsString() @IsNotEmpty() reason: string;
}

@Injectable()
export class FinancesService {
  constructor(private readonly paystackService: PaystackService) {}

  async getBalance() {
    const balances = await this.paystackService.getBalance();
    return balances;
  }

  async getTransfers(page = 1, perPage = 50) {
    return this.paystackService.listTransfers(perPage, page);
  }

  async getBanks() {
    return this.paystackService.listBanks();
  }

  async withdraw(dto: WithdrawDto) {
    const recipientCode = await this.paystackService.createRecipient(
      dto.accountName,
      dto.accountNumber,
      dto.bankCode,
    );
    const amountKobo = Math.round(dto.amount * 100);
    const transfer = await this.paystackService.initiateTransfer(
      amountKobo,
      recipientCode,
      dto.reason,
    );
    return transfer;
  }
}
