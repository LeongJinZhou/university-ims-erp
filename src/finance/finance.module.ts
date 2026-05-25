import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { BillingService } from './billing.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [FinanceController],
  providers: [FinanceService, BillingService, PrismaService],
  exports: [FinanceService, BillingService],
})
export class FinanceModule {}