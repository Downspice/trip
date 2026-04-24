import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';

@Injectable()
export class StudentsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: any) {
    return this.prisma.student.create({
      data: dto,
      include: { house: true, programme: true },
    });
  }

  async findAll() {
    return this.prisma.student.findMany({
      include: { house: true, programme: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: { house: true, programme: true },
    });
    if (!student) throw new NotFoundException(`Student ${id} not found`);
    return student;
  }
}
