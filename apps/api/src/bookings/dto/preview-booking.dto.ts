import { IsString, IsEmail, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum TripType {
  ONE_WAY_TO_SCHOOL = 'ONE_WAY_TO_SCHOOL',
  ONE_WAY_FROM_SCHOOL = 'ONE_WAY_FROM_SCHOOL',
}

export class PreviewBookingDto {
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
  @IsNotEmpty()
  programmeId: string;

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
  routeId: string;

  @IsEnum(TripType)
  tripType: TripType;

  @IsString()
  @IsOptional()
  stopName?: string;

  @IsString()
  @IsOptional()
  customDropoff?: string;

  @IsString()
  @IsNotEmpty()
  whatsappContact: string;
}
