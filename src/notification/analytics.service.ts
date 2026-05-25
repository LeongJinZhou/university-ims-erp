import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name)

  constructor(private prisma: PrismaService) {}

  async computeEnrolmentMetrics(period: string) {
    const semester = await this.prisma.semester.findFirst({
      where: { label: period },
    })

    const enrolments = await this.prisma.enrolment.count({
      where: { semesterId: semester?.id, isDropped: false },
    })

    const courseOfferings = await this.prisma.courseOffering.findMany({
      where: { semesterId: semester?.id },
      include: { course: true },
    })

    const capacityUtilization = courseOfferings.map(co => ({
      courseCode: co.course.code,
      enrolment: co.currentEnrolment,
      capacity: co.maxCapacity,
      utilization: (co.currentEnrolment / co.maxCapacity) * 100,
    }))

    const avgUtilization = capacityUtilization.reduce((sum, c) => sum + c.utilization, 0) / capacityUtilization.length || 0

    const snapshot = await this.prisma.analyticsSnapshot.create({
      data: {
        metricType: 'ENROLMENT_RATES',
        period,
        data: {
          totalEnrolments: enrolments,
          totalCourses: courseOfferings.length,
          averageUtilization: Math.round(avgUtilization * 100) / 100,
          courseUtilization: capacityUtilization,
        },
      },
    })

    this.logger.log(`Enrolment metrics computed for ${period}`)
    return snapshot
  }

  async computeGpaDistribution(period: string) {
    const examResults = await this.prisma.examResult.findMany({
      include: { student: true },
    })

    const buckets = {
      '4.0-3.5': 0,
      '3.5-3.0': 0,
      '3.0-2.5': 0,
      '2.5-2.0': 0,
      '2.0-1.0': 0,
      '1.0-0.0': 0,
    }

    for (const result of examResults) {
      const gp = result.gradePoint
      if (gp >= 3.5) buckets['4.0-3.5']++
      else if (gp >= 3.0) buckets['3.5-3.0']++
      else if (gp >= 2.5) buckets['3.0-2.5']++
      else if (gp >= 2.0) buckets['2.5-2.0']++
      else if (gp >= 1.0) buckets['2.0-1.0']++
      else buckets['1.0-0.0']++
    }

    const snapshot = await this.prisma.analyticsSnapshot.create({
      data: {
        metricType: 'GPA_DISTRIBUTION',
        period,
        data: {
          buckets,
          totalResults: examResults.length,
        },
      },
    })

    this.logger.log(`GPA distribution computed for ${period}`)
    return snapshot
  }

  async computeRevenueMetrics(period: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: { semester: { label: period } },
    })

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0)
    const outstanding = totalAmount - totalPaid

    const snapshot = await this.prisma.analyticsSnapshot.create({
      data: {
        metricType: 'REVENUE',
        period,
        data: {
          totalInvoiced: totalAmount,
          totalPaid,
          outstanding,
          invoiceCount: invoices.length,
          collectionRate: totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 10000) / 100 : 0,
        },
      },
    })

    this.logger.log(`Revenue metrics computed for ${period}`)
    return snapshot
  }

  async getLatestSnapshot(metricType: string) {
    return this.prisma.analyticsSnapshot.findFirst({
      where: { metricType },
      orderBy: { computedAt: 'desc' },
    })
  }

  async getSnapshotsByPeriod(period: string) {
    return this.prisma.analyticsSnapshot.findMany({
      where: { period },
      orderBy: { computedAt: 'desc' },
    })
  }
}