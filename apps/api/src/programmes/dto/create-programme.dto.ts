import { IsString, IsNotEmpty } from 'class-validator';

export class CreateProgrammeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  schoolId: string;
}
