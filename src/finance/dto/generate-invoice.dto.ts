import { IsString, IsOptional, IsDateString } from 'class-validator';

export class GenerateInvoiceDto {
  @IsString()
  studentId: string;

  @IsString()
  semesterId: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}