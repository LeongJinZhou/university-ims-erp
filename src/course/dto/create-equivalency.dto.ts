import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateEquivalencyDto {
  @IsString()
  courseAId: string;

  @IsString()
  courseBId: string;

  @IsOptional()
  @IsBoolean()
  isDeliveryMerge?: boolean;

  @IsOptional()
  @IsString()
  approvedBy?: string;
}