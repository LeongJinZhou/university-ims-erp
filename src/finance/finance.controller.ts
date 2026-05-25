import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { BillingService } from './billing.service';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';
import { AppealBillingDto } from './dto/appeal-billing.dto';

@Controller('finance')
export class FinanceController {
  constructor(
    private service: FinanceService,
    private billingService: BillingService,
  ) {}

  @Post('invoices')
  generateInvoice(@Body() dto: GenerateInvoiceDto) {
    return this.service.generateInvoice(dto);
  }

  @Get('invoices')
  getAllInvoices() {
    return this.service.getStudentInvoices('');
  }

  @Get('invoices/student/:studentId')
  getStudentInvoices(@Param('studentId') studentId: string) {
    return this.service.getStudentInvoices(studentId);
  }

  @Post('appeal-billing')
  processOverloadAppealBilling(@Body() dto: AppealBillingDto) {
    return this.service.processOverloadAppealBilling(dto);
  }

  @Post('payments/:invoiceId')
  recordPayment(@Param('invoiceId') invoiceId: string, @Body() body: { amount: number; method: string }) {
    return this.service.recordPayment(invoiceId, body.amount, body.method);
  }
}