import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeeType } from '@prisma/client';

export type EnrolmentAction = 'ENROL' | 'DROP';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async generateInvoiceItemForEnrollment(
    studentId: string,
    courseOfferingId: string,
    semesterId: string
  ): Promise<void> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { programme: true },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const offering = await this.prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
      include: { course: true },
    });

    if (!offering) {
      throw new NotFoundException('Course offering not found');
    }

    // Find or create invoice for this semester
    let invoice = await this.prisma.invoice.findFirst({
      where: { studentId, semesterId },
    });

    if (!invoice) {
      const invoiceCount = await this.prisma.invoice.count();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(4, '0')}`;

      invoice = await this.prisma.invoice.create({
        data: {
          studentId,
          semesterId,
          invoiceNumber,
          totalAmount: 0,
          balance: 0,
          dueDate: this.getDefaultDueDate(),
        },
      });
    }

    // Get tuition rate per credit hour
    const feeStructure = await this.prisma.feeStructure.findFirst({
      where: {
        programmeId: student.programmeId,
        feeType: FeeType.TUITION,
      },
      orderBy: { academicYear: 'desc' },
    });

    const ratePerCredit = feeStructure?.amount ?? 500; // Default MYR 500 per credit hour
    const totalAmount = ratePerCredit * offering.course.creditHours;

    // Create invoice item
    await this.prisma.invoiceItem.create({
      data: {
        invoiceId: invoice.id,
        description: `Tuition for ${offering.course.code} - ${offering.course.name}`,
        feeType: FeeType.TUITION,
        creditHours: offering.course.creditHours,
        unitAmount: ratePerCredit,
        quantity: 1,
        totalAmount,
        referenceId: courseOfferingId,
      },
    });

    // Update invoice totals
    await this.updateInvoiceTotals(invoice.id);
  }

  async removeInvoiceItemForDrop(
    studentId: string,
    courseOfferingId: string,
    semesterId: string
  ): Promise<void> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { studentId, semesterId },
      include: { invoiceItems: true },
    });

    if (!invoice) {
      return;
    }

    await this.prisma.invoiceItem.deleteMany({
      where: {
        invoiceId: invoice.id,
        referenceId: courseOfferingId,
      },
    });

    await this.updateInvoiceTotals(invoice.id);
  }

  async recalculateInvoice(studentId: string, semesterId: string): Promise<void> {
    const invoice = await this.prisma.invoice.findFirst({
      where: { studentId, semesterId },
      include: { invoiceItems: true },
    });

    if (!invoice) {
      return;
    }

    // Delete existing items and regenerate from enrolments
    await this.prisma.invoiceItem.deleteMany({
      where: { invoiceId: invoice.id },
    });

    const enrolments = await this.prisma.enrolment.findMany({
      where: { studentId, semesterId, isDropped: false },
      include: { courseOffering: { include: { course: true } } },
    });

    for (const enrolment of enrolments) {
      await this.generateInvoiceItemForEnrollment(
        studentId,
        enrolment.courseOfferingId,
        semesterId
      );
    }
  }

  private async updateInvoiceTotals(invoiceId: string): Promise<void> {
    const items = await this.prisma.invoiceItem.findMany({
      where: { invoiceId },
    });

    const totalAmount = items.reduce((sum, item) => sum + item.totalAmount, 0);

    const transactions = await this.prisma.transaction.findMany({
      where: { invoiceId: invoiceId, status: 'COMPLETED' },
    });

    const paidAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const balance = Math.max(0, totalAmount - paidAmount);

    let status = 'UNPAID';
    if (balance === 0) {
      status = 'PAID';
    } else if (paidAmount > 0) {
      status = 'PARTIAL';
    }

    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        totalAmount,
        paidAmount,
        balance,
        status,
      },
    });
  }

  private getDefaultDueDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }
}