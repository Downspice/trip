import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { PaystackService } from './paystack.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { InitializeVisitPaymentDto } from './dto/initialize-visit-payment.dto';
import { TripType } from '../bookings/dto/preview-booking.dto';
import { v4 as uuidv4 } from 'uuid';

function getPriceFromRoute(
  route: { priceToSchool: number; priceFromSchool: number },
  tripType: TripType,
): number {
  switch (tripType) {
    case TripType.ONE_WAY_TO_SCHOOL:
      return route.priceToSchool;
    case TripType.ONE_WAY_FROM_SCHOOL:
      return route.priceFromSchool;
    default:
      throw new BadRequestException('Invalid trip type');
  }
}

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private paystackService: PaystackService,
    private configService: ConfigService,
  ) { }

  async initialize(dto: InitializePaymentDto) {
    const [school, route, house] = await Promise.all([
      this.prisma.school.findUnique({ where: { id: dto.schoolId } }),
      this.prisma.route.findUnique({ where: { id: dto.routeId } }),
      this.prisma.house.findUnique({ where: { id: dto.houseId } }),
      // this.prisma.programme.findUnique({ where: { id: dto.programmeId } }),
    ]);

    if (!school) throw new NotFoundException('School not found');
    if (!route || route.schoolId !== dto.schoolId)
      throw new NotFoundException('Route not found or does not belong to the selected school');
    if (!house || house.schoolId !== dto.schoolId)
      throw new NotFoundException('House not found or does not belong to the selected school');
    // if (!programme || programme.schoolId !== dto.schoolId)
    //   throw new NotFoundException('Programme not found or does not belong to the selected school');

    const price = getPriceFromRoute(route, dto.tripType);

    const student = await this.prisma.student.create({
      data: {
        studentName: dto.studentName,
        class: dto.class,
        schoolId: school.id,
        houseId: house.id,
        // programmeId: programme.id,
        email: dto.email,
        parentName: dto.parentName,
        parentContact: dto.parentContact,
        whatsappContact: dto.whatsappContact,
      },
    });

    const reference = `trip-${uuidv4()}`;
    const booking = await this.prisma.booking.create({
      data: {
        studentId: student.id,
        routeId: route.id,
        tripType: dto.tripType,
        stopName: dto.stopName ?? null,
        customDropoff: dto.customDropoff ?? null,
        price,
        paymentReference: reference,
        paymentStatus: 'PENDING',
        type: 'STUDENT_TRIP',
      },
    });

    const callbackUrl = this.configService.getOrThrow<string>('PAYSTACK_CALLBACK_URL');
    const amountKobo = Math.round(price * 100);

    const paystack = await this.paystackService.initializePayment(
      dto.email,
      amountKobo,
      reference,
      callbackUrl,
      { bookingId: booking.id, studentName: dto.studentName, type: 'STUDENT_TRIP' },
    );

    return {
      authorization_url: paystack.authorization_url,
      access_code: paystack.access_code,
      reference,
      bookingId: booking.id,
      price,
    };
  }

  async initializeVisit(dto: InitializeVisitPaymentDto) {
    const [school, route] = await Promise.all([
      this.prisma.school.findUnique({ where: { id: dto.schoolId } }),
      this.prisma.route.findUnique({ where: { id: dto.routeId } }),
    ]);

    if (!school) throw new NotFoundException('School not found');
    if (!route || route.schoolId !== dto.schoolId)
      throw new NotFoundException('Route not found or does not belong to the selected school');

    const price = getPriceFromRoute(route, dto.tripType);

    const parentVisit = await this.prisma.parentVisit.create({
      data: {
        parentName: dto.parentName,
        parentContact: dto.parentContact,
        whatsappContact: dto.whatsappContact,
        email: dto.email,
        schoolId: dto.schoolId,
      },
    });

    const reference = `visit-${uuidv4()}`;
    const booking = await this.prisma.booking.create({
      data: {
        parentVisitId: parentVisit.id,
        routeId: route.id,
        tripType: dto.tripType,
        stopName: dto.stopName ?? null,
        customDropoff: dto.customDropoff ?? null,
        price,
        paymentReference: reference,
        paymentStatus: 'PENDING',
        type: 'PARENT_VISIT',
      },
    });

    const callbackUrl = this.configService.getOrThrow<string>('PAYSTACK_CALLBACK_URL');
    const amountKobo = Math.round(price * 100);

    const paystack = await this.paystackService.initializePayment(
      dto.email,
      amountKobo,
      reference,
      callbackUrl,
      { bookingId: booking.id, parentName: dto.parentName, type: 'PARENT_VISIT' },
    );

    return {
      authorization_url: paystack.authorization_url,
      access_code: paystack.access_code,
      reference,
      bookingId: booking.id,
      price,
    };
  }


  async verify(reference: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { paymentReference: reference },
      include: {
        student: { include: { house: true, programme: true, school: true } },
        parentVisit: { include: { school: true } },
        route: { include: { stops: true } },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.paymentStatus === 'SUCCESS') {
      return { success: true, booking };
    }

    const verification = await this.paystackService.verifyPayment(reference);

    if (verification.status === 'success') {
      const updated = await this.prisma.booking.update({
        where: { paymentReference: reference },
        data: { paymentStatus: 'SUCCESS' },
        include: {
          student: { include: { house: true, programme: true, school: true } },
          parentVisit: { include: { school: true } },
          route: { include: { stops: true } },
        },
      });
      return { success: true, booking: updated };
    } else {
      await this.prisma.booking.update({
        where: { paymentReference: reference },
        data: { paymentStatus: 'FAILED' },
      });
      return { success: false, booking };
    }
  }

  async handleWebhook(payload: any) {
    if (payload.event !== 'charge.success') return { received: true };

    const reference = payload.data?.reference;
    if (!reference) return { received: true };

    const booking = await this.prisma.booking.findUnique({
      where: { paymentReference: reference },
    });

    if (booking && booking.paymentStatus !== 'SUCCESS') {
      await this.prisma.booking.update({
        where: { paymentReference: reference },
        data: { paymentStatus: 'SUCCESS' },
      });
    }

    return { received: true };
  }
}
