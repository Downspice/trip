import {
  Controller, Post, Body, Get, Param, Patch, Delete, UseGuards, Request,
} from '@nestjs/common';
import { AdminRole } from '@prisma/client';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  // ─── Admin Management (SUPER_ADMIN only) ─────────────────────────────────

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @Get('admins')
  listAdmins() {
    return this.authService.listAdmins();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @Post('admins')
  createAdmin(@Body() dto: CreateAdminDto, @Request() req: any) {
    return this.authService.createAdmin(dto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admins/:id')
  updateAdmin(@Param('id') id: string, @Body() dto: UpdateAdminDto, @Request() req: any) {
    return this.authService.updateAdmin(id, dto, req.user);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPER_ADMIN)
  @Delete('admins/:id')
  deleteAdmin(@Param('id') id: string, @Request() req: any) {
    return this.authService.deleteAdmin(id, req.user);
  }
}
