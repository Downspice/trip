import { IsString, IsEmail, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TripType } from '../../bookings/dto/preview-booking.dto';

export class InitializeVisitPaymentDto {
  @IsString()
  @IsNotEmpty()
  parentName: string;

  @IsString()
  @IsNotEmpty()
  parentContact: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  schoolId: string;

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
}
