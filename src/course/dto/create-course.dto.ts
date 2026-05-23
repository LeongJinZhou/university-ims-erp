import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean, Min, IsNotEmpty } from 'class-validator';
import { CourseType } from '@prisma/client';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
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