import { IsOptional, IsString } from 'class-validator';

export class StudyPlanViewDto {
  @IsOptional()
  @IsString()
  format?: 'detailed' | 'summary';
}