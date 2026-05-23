import { IsString, IsOptional, IsEnum, IsNumber, Min } from 'class-validator';
import { ContractType } from '@prisma/client';

export class CreateLecturerDto {
  @IsString()
  userId: string;

  @IsString()
  staffId: string;

  @IsString()
  facultyId: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsEnum(ContractType)
  contractType: ContractType;

  @IsNumber()
  @Min(0)
  maxTeachingLoad: number;
}