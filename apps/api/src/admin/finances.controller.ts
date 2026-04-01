import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { FinancesService, WithdrawDto } from './finances.service';

@Controller('admin/finances')
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @Get('balance')
  getBalance() {
    return this.financesService.getBalance();
  }

  @Get('transfers')
  getTransfers(@Query('page') page = 1, @Query('perPage') perPage = 50) {
    return this.financesService.getTransfers(+page, +perPage);
  }

  @Get('banks')
  getBanks() {
    return this.financesService.getBanks();
  }

  @Post('withdraw')
  withdraw(@Body() dto: WithdrawDto) {
    return this.financesService.withdraw(dto);
  }
}
