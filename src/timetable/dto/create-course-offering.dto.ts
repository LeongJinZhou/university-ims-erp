import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateCourseOfferingDto {
  @IsString()
  courseId: string;

  @IsString()
  semesterId: string;

  @IsString()
  lecturerId: string;

  @IsNumber()
  maxCapacity: number;

  @IsOptional()
  @IsNumber()
  currentEnrolment?: number;

  @IsOptional()
  @IsBoolean()
  isConfirmed?: boolean;
}