import { IsString, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class CreateRouteDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  schoolId: string;

  @IsNumber()
  @Min(0)
  priceToSchool: number;

  @IsNumber()
  @Min(0)
  priceFromSchool: number;
}
