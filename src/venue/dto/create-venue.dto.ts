import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateVenueDto {
  @IsString()
  name: string;

  @IsString()
  building: string;

  @IsNumber()
  floor: number;
}