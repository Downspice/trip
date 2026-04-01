import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHouseDto } from './dto/create-house.dto';
import { UpdateHouseDto } from './dto/update-house.dto';

@Injectable()
export class HousesService {
  constructor(private prisma: PrismaService) {}

  async create(createHouseDto: CreateHouseDto) {
    return this.prisma.house.create({
      data: createHouseDto,
    });
  }

  async findAll(schoolId?: string) {
    const where = schoolId ? { schoolId } : {};
    return this.prisma.house.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const house = await this.prisma.house.findUnique({
      where: { id },
    });
    if (!house) throw new NotFoundException('House not found');
    return house;
  }

  async update(id: string, updateHouseDto: UpdateHouseDto) {
    await this.findOne(id); // Ensure exists
    return this.prisma.house.update({
      where: { id },
      data: updateHouseDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.house.delete({
      where: { id },
    });
  }
}
