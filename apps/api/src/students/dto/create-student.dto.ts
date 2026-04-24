import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  studentName: string;

  @IsString()
  @IsNotEmpty()
  class: string;

  @IsString()
  @IsNotEmpty()
  schoolId: string;

  @IsString()
  @IsNotEmpty()
  houseId: string;

  @IsString()
  @IsOptional()
  programmeId?: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  parentName: string;

  @IsString()
  @IsNotEmpty()
  parentContact: string;

  @IsString()
  @IsNotEmpty()
  whatsappContact: string;
}
