import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRouteDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  priceToSchool?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  priceFromSchool?: number;
}
