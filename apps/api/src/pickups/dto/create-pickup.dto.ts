import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreatePickupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  @IsNotEmpty()
  schoolId: string;
}
