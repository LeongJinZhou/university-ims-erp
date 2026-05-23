import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  venueId: string;

  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsNumber()
  capacity: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  floorPlanX?: number;

  @IsOptional()
  @IsNumber()
  floorPlanY?: number;
}