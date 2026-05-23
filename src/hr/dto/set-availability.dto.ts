import { IsString, IsArray, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class SetAvailabilityDto {
  @IsString()
  lecturerId: string;

  @IsString()
  semesterId: string;

  @IsArray()
  availableDays: number[];

  @IsOptional()
  @IsString()
  preferredStartTime?: string = '08:00';

  @IsOptional()
  @IsString()
  preferredEndTime?: string = '18:00';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(8)
  maxConsecutiveHours?: number = 2;
}