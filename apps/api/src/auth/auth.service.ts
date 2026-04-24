import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AdminRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const admin = await this.prisma.admin.findUnique({ where: { email: dto.email } });
    if (!admin) throw new UnauthorizedException('Invalid email or password');

    const passwordMatch = await bcrypt.compare(dto.password, admin.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid email or password');

    const token = this.jwtService.sign({
      sub: admin.id,
      email: admin.email,
      role: admin.role,
    });

    return {
      access_token: token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  async getProfile(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!admin) throw new NotFoundException('Admin not found');
    return admin;
  }

  async listAdmins() {
    return this.prisma.admin.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createAdmin(dto: CreateAdminDto, creator: { role: AdminRole }) {
    // Only SUPER_ADMIN can create another SUPER_ADMIN
    if (dto.role === AdminRole.SUPER_ADMIN && creator.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can create super admin accounts');
    }

    const existing = await this.prisma.admin.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('An admin with this email already exists');

    const hashed = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const admin = await this.prisma.admin.create({
      data: { name: dto.name, email: dto.email, password: hashed, role: dto.role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return admin;
  }

  async updateAdmin(
    targetId: string,
    dto: UpdateAdminDto,
    requester: { id: string; role: AdminRole },
  ) {
    // Only SUPER_ADMIN can change roles or update other admins
    if (targetId !== requester.id && requester.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('You can only update your own account');
    }
    if (dto.role && requester.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can change roles');
    }

    const target = await this.prisma.admin.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundException('Admin not found');

    const data: any = {};
    if (dto.name) data.name = dto.name;
    if (dto.email) data.email = dto.email;
    if (dto.role) data.role = dto.role;
    if (dto.password) data.password = await bcrypt.hash(dto.password, SALT_ROUNDS);

    return this.prisma.admin.update({
      where: { id: targetId },
      data,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }

  async deleteAdmin(targetId: string, requester: { id: string; role: AdminRole }) {
    if (requester.role !== AdminRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only super admins can delete admin accounts');
    }
    if (targetId === requester.id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    const target = await this.prisma.admin.findUnique({ where: { id: targetId } });
    if (!target) throw new NotFoundException('Admin not found');

    await this.prisma.admin.delete({ where: { id: targetId } });
    return { message: 'Admin account deleted successfully' };
  }
}
