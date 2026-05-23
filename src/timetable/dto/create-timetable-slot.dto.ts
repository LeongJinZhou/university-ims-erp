import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateTimetableSlotDto {
  @IsString()
  timetableId: string;

  @IsString()
  courseOfferingId: string;

  @IsString()
  sectionId: string;

  @IsString()
  venueId: string;

  @IsNumber()
  dayOfWeek: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsOptional()
  @IsBoolean()
  isMergedClass?: boolean;
}