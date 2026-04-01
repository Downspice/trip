import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProgrammeDto } from './dto/create-programme.dto';
import { UpdateProgrammeDto } from './dto/update-programme.dto';

@Injectable()
export class ProgrammesService {
  constructor(private prisma: PrismaService) {}

  async create(createProgrammeDto: CreateProgrammeDto) {
    return this.prisma.programme.create({
      data: createProgrammeDto,
    });
  }

  async findAll(schoolId?: string) {
    const where = schoolId ? { schoolId } : {};
    return this.prisma.programme.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const programme = await this.prisma.programme.findUnique({
      where: { id },
    });
    if (!programme) throw new NotFoundException('Programme not found');
    return programme;
  }

  async update(id: string, updateProgrammeDto: UpdateProgrammeDto) {
    await this.findOne(id); // Ensure exists
    return this.prisma.programme.update({
      where: { id },
      data: updateProgrammeDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.programme.delete({
      where: { id },
    });
  }
}
