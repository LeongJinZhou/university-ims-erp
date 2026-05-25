import { IsString, IsArray, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class SolveTimetableDto {
  @IsString()
  semesterId: string;

  @IsArray()
  @IsOptional()
  offeringIds?: string[];

  @IsBoolean()
  @IsOptional()
  useMergeLogic?: boolean;
}