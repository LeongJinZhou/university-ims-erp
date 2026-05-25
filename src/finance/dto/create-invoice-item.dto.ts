import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { FeeType } from '@prisma/client';

export class CreateInvoiceItemDto {
  @IsString()
  invoiceId: string;

  @IsString()
  description: string;

  @IsEnum(FeeType)
  feeType: FeeType;

  @IsOptional()
  @IsNumber()
  creditHours?: number;

  @IsNumber()
  unitAmount: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  referenceId?: string;
}