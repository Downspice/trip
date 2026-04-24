import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { AdminRole } from '@prisma/client';

export class UpdateAdminDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @IsOptional()
  password?: string;

  @IsEnum(AdminRole)
  @IsOptional()
  role?: AdminRole;
}
