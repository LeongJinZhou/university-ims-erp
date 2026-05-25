import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateRetakePlanDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  projectedGraduation: string;

  @IsString()
  @IsOptional()
  resultReleaseId?: string;
}