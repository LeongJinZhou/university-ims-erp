import { IsString, IsNumber, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { CalendarType } from '@prisma/client';

export class CreateProgrammeDto {
  @IsString()
  facultyId: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsEnum(CalendarType)
  calendarType: CalendarType;

  @IsNumber()
  totalCredits: number;

  @IsNumber()
  maxDurationSemesters: number;

  @IsOptional()
  @IsString()
  mqaRefNumber?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}