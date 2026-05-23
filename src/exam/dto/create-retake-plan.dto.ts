import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRetakePlanDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  projectedGraduation: string;
}