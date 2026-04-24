import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface PaystackInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

interface PaystackVerifyData {
  status: string;
  reference: string;
  amount: number;
  customer: { email: string };
  metadata?: Record<string, any>;
}

@Injectable()
export class PaystackService {
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.getOrThrow<string>('PAYSTACK_SECRET_KEY');
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      'Content-Type': 'application/json',
    };
  }

  async initializePayment(
    email: string,
    amountKobo: number,
    reference: string,
    callbackUrl: string,
    metadata: Record<string, any> = {},
  ): Promise<PaystackInitResponse> {
    try {
      const { data } = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        { email, amount: amountKobo, reference, callback_url: callbackUrl, metadata },
        { headers: this.headers },
      );

      if (!data.status) {
        throw new BadRequestException(data.message || 'Failed to initialize payment');
      }

      return data.data as PaystackInitResponse;
    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.message || 'Paystack initialization error',
      );
    }
  }

  async verifyPayment(reference: string): Promise<PaystackVerifyData> {
    try {
      const { data } = await axios.get(
        `${this.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`,
        { headers: this.headers },
      );

      if (!data.status) {
        throw new BadRequestException(data.message || 'Payment verification failed');
      }

      return data.data as PaystackVerifyData;
    } catch (error: any) {
      throw new BadRequestException(
        error.response?.data?.message || 'Paystack verification error',
      );
    }
  }

  async getBalance(): Promise<{ currency: string; balance: number }[]> {
    try {
      const { data } = await axios.get(`${this.baseUrl}/balance`, { headers: this.headers });
      if (!data.status) throw new BadRequestException(data.message);
      return data.data;
    } catch (error: any) {
      throw new BadRequestException(error.response?.data?.message || 'Failed to fetch balance');
    }
  }

  async listTransfers(perPage = 50, page = 1): Promise<any> {
    try {
      const { data } = await axios.get(
        `${this.baseUrl}/transfer?perPage=${perPage}&page=${page}`,
        { headers: this.headers },
      );
      if (!data.status) throw new BadRequestException(data.message);
      return data.data;
    } catch (error: any) {
      throw new BadRequestException(error.response?.data?.message || 'Failed to fetch transfers');
    }
  }

  async listBanks(): Promise<any[]> {
    try {
      const { data } = await axios.get(
        `${this.baseUrl}/bank?currency=GHS&perPage=100`,
        { headers: this.headers },
      );
      if (!data.status) throw new BadRequestException(data.message);
      return data.data;
    } catch (error: any) {
      throw new BadRequestException(error.response?.data?.message || 'Failed to fetch banks');
    }
  }

  async createRecipient(name: string, accountNumber: string, bankCode: string): Promise<string> {
    try {
      const { data } = await axios.post(
        `${this.baseUrl}/transferrecipient`,
        { type: 'ghipss', name, account_number: accountNumber, bank_code: bankCode, currency: 'GHS' },
        { headers: this.headers },
      );
      if (!data.status) throw new BadRequestException(data.message);
      return data.data.recipient_code;
    } catch (error: any) {
      throw new BadRequestException(error.response?.data?.message || 'Failed to create recipient');
    }
  }

  async initiateTransfer(amountKobo: number, recipientCode: string, reason: string): Promise<any> {
    try {
      const { data } = await axios.post(
        `${this.baseUrl}/transfer`,
        { source: 'balance', amount: amountKobo, recipient: recipientCode, reason },
        { headers: this.headers },
      );
      if (!data.status) throw new BadRequestException(data.message);
      return data.data;
    } catch (error: any) {
      throw new BadRequestException(error.response?.data?.message || 'Failed to initiate transfer');
    }
  }
}
