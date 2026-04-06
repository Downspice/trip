import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PreviewBookingDto } from './dto/preview-booking.dto';
import { PreviewVisitBookingDto } from './dto/preview-visit-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('preview')
  preview(@Body() dto: PreviewBookingDto) {
    return this.bookingsService.preview(dto);
  }

  @Post('preview-visit')
  previewVisit(@Body() dto: PreviewVisitBookingDto) {
    return this.bookingsService.previewVisit(dto);
  }

  // @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('clear')
  clearAll() {
    return this.bookingsService.clearAll();
  }
}
