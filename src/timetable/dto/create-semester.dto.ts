import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, IsBoolean } from 'class-validator';
import { SemesterType } from '@prisma/client';

export class CreateSemesterDto {
  @IsString()
  label: string;

  @IsNumber()
  year: number;

  @IsNumber()
  semesterNum: number;

  @IsEnum(SemesterType)
  semesterType: SemesterType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}