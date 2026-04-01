import { IsString, IsNotEmpty } from 'class-validator';

export class AddStopDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
