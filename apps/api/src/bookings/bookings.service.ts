import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PreviewBookingDto, TripType } from './dto/preview-booking.dto';
import { PreviewVisitBookingDto } from './dto/preview-visit-booking.dto';

function getPriceFromRoute(route: { priceToSchool: number; priceFromSchool: number }, tripType: TripType): number {
  switch (tripType) {
    case TripType.ONE_WAY_TO_SCHOOL: return route.priceToSchool;
    case TripType.ONE_WAY_FROM_SCHOOL: return route.priceFromSchool;
    default: throw new BadRequestException('Invalid trip type');
  }
}

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Returns a price preview without persisting anything yet.
   * Price is ALWAYS fetched from DB — never trusted from the client.
   */
  async preview(dto: PreviewBookingDto) {
    const [school, route, house, programme] = await Promise.all([
      this.prisma.school.findUnique({ where: { id: dto.schoolId } }),
      this.prisma.route.findUnique({ where: { id: dto.routeId }, include: { stops: true } }),
      this.prisma.house.findUnique({ where: { id: dto.houseId } }),
      this.prisma.programme.findUnique({ where: { id: dto.programmeId } }),
    ]);

    if (!school) throw new NotFoundException('School not found');
    if (!route || route.schoolId !== dto.schoolId) throw new NotFoundException('Route not found or does not belong to the selected school');
    if (!house || house.schoolId !== dto.schoolId) throw new NotFoundException('House not found or does not belong to the selected school');
    if (!programme || programme.schoolId !== dto.schoolId) throw new NotFoundException('Programme not found or does not belong to the selected school');

    const price = getPriceFromRoute(route, dto.tripType);

    return {
      studentName: dto.studentName,
      class: dto.class,
      email: dto.email,
      parentName: dto.parentName,
      parentContact: dto.parentContact,
      school: { id: school.id, name: school.name },
      house: { id: house.id, name: house.name },
      programme: { id: programme.id, name: programme.name },
      route: { id: route.id, name: route.name, stops: route.stops },
      tripType: dto.tripType,
      stopName: dto.stopName ?? null,
      customDropoff: dto.customDropoff ?? null,
      price,
    };
  }

  async previewVisit(dto: PreviewVisitBookingDto) {
    const [school, route] = await Promise.all([
      this.prisma.school.findUnique({ where: { id: dto.schoolId } }),
      this.prisma.route.findUnique({ where: { id: dto.routeId }, include: { stops: true } }),
    ]);

    if (!school) throw new NotFoundException('School not found');
    if (!route || route.schoolId !== dto.schoolId)
      throw new NotFoundException('Route not found or does not belong to the selected school');

    const price = getPriceFromRoute(route, dto.tripType);

    return {
      parentName: dto.parentName,
      parentContact: dto.parentContact,
      email: dto.email,
      school: { id: school.id, name: school.name },
      route: { id: route.id, name: route.name, stops: route.stops },
      tripType: dto.tripType,
      stopName: dto.stopName ?? null,
      customDropoff: dto.customDropoff ?? null,
      price,
    };
  }


  async findByReference(paymentReference: string) {
    return this.prisma.booking.findUnique({
      where: { paymentReference },
      include: {
        student: { include: { house: true, programme: true, school: true } },
        parentVisit: { include: { school: true } },
        route: { include: { stops: true } },
      },
    });
  }

  async findAll() {
    return this.prisma.booking.findMany({
      include: {
        student: { include: { house: true, programme: true, school: true } },
        parentVisit: { include: { school: true } },
        route: { include: { stops: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async clearAll() {
    // Delete in a transaction to ensure everything clears (ParentVisit and Student).
    // Booking table has relations to Student and ParentVisit. If we delete student/parentVisit, 
    // it depends on how the cascade is setup. Usually deleting Bookings is safe, but we also want 
    // to wipe the actual Student/ParentVisit records created for those bookings.
    return this.prisma.$transaction([
      this.prisma.booking.deleteMany(),
      this.prisma.student.deleteMany(),
      this.prisma.parentVisit.deleteMany(),
    ]);
  }
}


