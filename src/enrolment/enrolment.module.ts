import { Module } from '@nestjs/common';
import { EnrolmentController } from './enrolment.controller';
import { EnrolmentService } from './enrolment.service';
import { PrismaService } from '../prisma/prisma.service';
import { FinanceModule } from '../finance/finance.module';

@Module({
  imports: [FinanceModule],
  controllers: [EnrolmentController],
  providers: [EnrolmentService, PrismaService],
  exports: [EnrolmentService],
})
export class EnrolmentModule {}