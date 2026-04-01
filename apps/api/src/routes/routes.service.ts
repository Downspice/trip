import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { AddStopDto } from './dto/add-stop.dto';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async findAll(schoolId?: string) {
    return this.prisma.route.findMany({
      where: schoolId ? { schoolId } : undefined,
      include: { stops: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: { stops: true },
    });
    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  async create(dto: CreateRouteDto) {
    const school = await this.prisma.school.findUnique({ where: { id: dto.schoolId } });
    if (!school) throw new NotFoundException('School not found');
    try {
      return await this.prisma.route.create({
        data: {
          name: dto.name,
          schoolId: dto.schoolId,
          priceToSchool: dto.priceToSchool,
          priceFromSchool: dto.priceFromSchool,
        },
        include: { stops: true },
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('A route with this name already exists for this school');
      throw e;
    }
  }

  async update(id: string, dto: UpdateRouteDto) {
    await this.findOne(id);
    return this.prisma.route.update({
      where: { id },
      data: dto,
      include: { stops: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.route.delete({ where: { id } });
    return { message: 'Route deleted' };
  }

  async addStop(routeId: string, dto: AddStopDto) {
    await this.findOne(routeId);
    try {
      return await this.prisma.routeStop.create({
        data: { name: dto.name, routeId },
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('A stop with this name already exists on this route');
      throw e;
    }
  }

  async updateStop(routeId: string, stopId: string, name: string) {
    const stop = await this.prisma.routeStop.findFirst({ where: { id: stopId, routeId } });
    if (!stop) throw new NotFoundException('Stop not found on this route');
    try {
      return await this.prisma.routeStop.update({
        where: { id: stopId },
        data: { name },
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictException('A stop with this name already exists on this route');
      throw e;
    }
  }

  async removeStop(routeId: string, stopId: string) {
    const stop = await this.prisma.routeStop.findFirst({ where: { id: stopId, routeId } });
    if (!stop) throw new NotFoundException('Stop not found on this route');
    await this.prisma.routeStop.delete({ where: { id: stopId } });
    return { message: 'Stop removed' };
  }
}
