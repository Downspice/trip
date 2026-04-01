// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { CreatePickupDto } from './dto/create-pickup.dto';
// import { UpdatePickupDto } from './dto/update-pickup.dto';

// @Injectable()
// export class PickupsService {
//   constructor(private prisma: PrismaService) {}

//   async create(createPickupDto: CreatePickupDto) {
//     return this.prisma.pickup.create({
//       data: createPickupDto,
//     });
//   }

//   async findAll(schoolId?: string) {
//     const where = schoolId ? { schoolId } : {};
//     return this.prisma.pickup.findMany({
//       where,
//       orderBy: { name: 'asc' },
//     });
//   }

//   async findOne(id: string) {
//     const pickup = await this.prisma.pickup.findUnique({
//       where: { id },
//     });
//     if (!pickup) throw new NotFoundException('Pickup not found');
//     return pickup;
//   }

//   async update(id: string, updatePickupDto: UpdatePickupDto) {
//     await this.findOne(id); // Ensure exists
//     return this.prisma.pickup.update({
//       where: { id },
//       data: updatePickupDto,
//     });
//   }

//   async remove(id: string) {
//     await this.findOne(id);
//     return this.prisma.pickup.delete({
//       where: { id },
//     });
//   }
// }
