import { Controller, Get, Post, Body, Query, Headers, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { InitializeVisitPaymentDto } from './dto/initialize-visit-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initialize')
  initialize(@Body() dto: InitializePaymentDto) {
    return this.paymentsService.initialize(dto);
  }

  @Post('initialize-visit')
  initializeVisit(@Body() dto: InitializeVisitPaymentDto) {
    return this.paymentsService.initializeVisit(dto);
  }

  @Get('verify')
  verify(@Query('reference') reference: string) {
    return this.paymentsService.verify(reference);
  }

  @Post('webhook')
  @HttpCode(200)
  webhook(@Body() payload: any, @Headers('x-paystack-signature') signature: string) {
    // In production, validate the signature using HMAC SHA512
    return this.paymentsService.handleWebhook(payload);
  }
}
