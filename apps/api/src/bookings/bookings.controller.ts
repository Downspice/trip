import { Controller, Post, Body, Get } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PreviewBookingDto } from './dto/preview-booking.dto';
import { PreviewVisitBookingDto } from './dto/preview-visit-booking.dto';

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

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @Post('clear')
  clearAll() {
    return this.bookingsService.clearAll();
  }
}
