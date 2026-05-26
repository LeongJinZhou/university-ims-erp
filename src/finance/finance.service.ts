import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateInvoiceDto } from './dto/generate-invoice.dto';
import { AppealBillingDto } from './dto/appeal-billing.dto';
import { FeeType } from '@prisma/client';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async generateInvoice(dto: GenerateInvoiceDto) {
    const { studentId, semesterId, dueDate } = dto;

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { programme: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const feeStructure = await this.prisma.feeStructure.findFirst({
      where: {
        programmeId: student.programmeId,
        feeType: FeeType.TUITION,
      },
      orderBy: { academicYear: 'desc' },
    });

    if (!feeStructure) {
      throw new BadRequestException('No tuition fee structure found for this programme');
    }

    const enrolments = await this.prisma.enrolment.findMany({
      where: { studentId, semesterId, isDropped: false },
      include: { courseOffering: { include: { course: true } } },
    });

    const totalCredits = enrolments.reduce(
      (sum, e) => sum + (e.courseOffering?.course?.creditHours ?? 0),
      0
    );

    const retakeFees = await this.calculateRetakeFees(studentId, semesterId);
    const overloadAppealFees = await this.calculateOverloadAppealFees(studentId, semesterId);

    const totalAmount = (feeStructure.amount * totalCredits) + retakeFees + overloadAppealFees;

    // Generate invoice number
    const invoiceCount = await this.prisma.invoice.count();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

    const invoice = await this.prisma.invoice.create({
      data: {
        studentId,
        semesterId,
        invoiceNumber,
        totalAmount,
        paidAmount: 0,
        balance: totalAmount,
        dueDate: dueDate ? new Date(dueDate) : this.getDefaultDueDate(),
        fees: {
          create: [
            {
              studentId,
              semesterId,
              feeType: FeeType.TUITION,
              amount: feeStructure.amount * totalCredits,
              currency: feeStructure.currency,
              description: `Tuition for ${totalCredits} credits`,
              creditHours: totalCredits,
            },
            ...(retakeFees > 0 ? [{
              studentId,
              semesterId,
              feeType: FeeType.RETAKE,
              amount: retakeFees,
              currency: feeStructure.currency,
              description: 'Retake fees',
            }] : []),
            ...(overloadAppealFees > 0 ? [{
              studentId,
              semesterId,
              feeType: FeeType.OVERLOAD,
              amount: overloadAppealFees,
              currency: feeStructure.currency,
              description: 'Overload appeal billing adjustment',
            }] : []),
          ],
        },
      },
      include: { fees: true },
    });

    return invoice;
  }

  async calculateRetakeFees(studentId: string, semesterId: string): Promise<number> {
    const retakePlan = await this.prisma.retakePlan.findFirst({
      where: { studentId },
      include: { failedCourses: true },
    });

    if (!retakePlan) return 0;

    const feeStructure = await this.prisma.feeStructure.findFirst({
      where: { feeType: FeeType.RETAKE },
      orderBy: { academicYear: 'desc' },
    });

    const retakeFee = feeStructure?.amount ?? 500;
    return retakePlan.failedCourses.length * retakeFee;
  }

  async calculateOverloadAppealFees(studentId: string, semesterId: string): Promise<number> {
    const approvedAppeals = await this.prisma.appeal.findMany({
      where: {
        studentId,
        appealType: 'CREDIT_OVERLOAD',
        status: 'HOP_APPROVED',
      },
    });

    if (!approvedAppeals.length) return 0;

    const feeStructure = await this.prisma.feeStructure.findFirst({
      where: { feeType: FeeType.OVERLOAD },
      orderBy: { academicYear: 'desc' },
    });

    return approvedAppeals.length * (feeStructure?.amount ?? 1000);
  }

  async processOverloadAppealBilling(dto: AppealBillingDto) {
    const { studentId, semesterId, appealId, additionalCredits } = dto;

    const appeal = await this.prisma.appeal.findUnique({
      where: { id: appealId },
    });

    if (!appeal) {
      throw new NotFoundException('Appeal not found');
    }

    const feeStructure = await this.prisma.feeStructure.findFirst({
      where: { feeType: FeeType.OVERLOAD },
      orderBy: { academicYear: 'desc' },
    });

    const overloadFee = feeStructure?.amount ?? 1000;
    const totalFee = overloadFee * additionalCredits;

    await this.prisma.fee.create({
      data: {
        studentId,
        semesterId,
        feeType: FeeType.OVERLOAD,
        amount: totalFee,
        currency: feeStructure?.currency ?? 'MYR',
        description: `Overload appeal billing for ${additionalCredits} additional credits`,
        creditHours: additionalCredits,
      },
    });

    return { appealId, amount: totalFee, additionalCredits };
  }

  async getStudentInvoices(studentId: string) {
    if (studentId) {
      return this.prisma.invoice.findMany({
        where: { studentId },
        include: { fees: true, payments: true },
        orderBy: { issuedAt: 'desc' },
      });
    }
    return this.prisma.invoice.findMany({
      include: { fees: true, payments: true, student: { include: { user: true } } },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async recordPayment(invoiceId: string, amount: number, method: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const payment = await this.prisma.payment.create({
      data: {
        invoiceId,
        amount,
        method: method as any,
        status: amount >= invoice.balance ? 'COMPLETED' : 'PENDING',
        paidAt: amount >= invoice.balance ? new Date() : null,
        reference: `PAY-${Date.now()}`,
      },
    });

    const newPaidAmount = invoice.paidAmount + amount;
    const newBalance = invoice.totalAmount - newPaidAmount;

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaidAmount,
        balance: newBalance,
        status: newBalance <= 0 ? 'PAID' : newBalance < invoice.totalAmount ? 'PARTIAL' : 'UNPAID',
      },
    });

    return payment;
  }

  private getDefaultDueDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }
}