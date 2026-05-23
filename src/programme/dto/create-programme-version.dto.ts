import { IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';

export class CreateProgrammeVersionDto {
  @IsString()
  programmeId: string;

  @IsString()
  version: string;

  @IsDateString()
  effectiveFrom: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}