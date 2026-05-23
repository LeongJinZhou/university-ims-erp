import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { CourseType } from '@prisma/client';

export class CreateCourseDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsNumber()
  creditHours: number;

  @IsEnum(CourseType)
  courseType: CourseType;

  @IsString()
  programmeId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}