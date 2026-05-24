import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationChannel, AppealStatus, AppealType, UserRole } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async sendNotification(recipientId: string, channel: NotificationChannel, title: string, body: string, data?: any) {
    const notification = await this.prisma.notification.create({
      data: {
        recipientId,
        channel,
        title,
        body,
        data: data || {},
      },
    });
    return notification;
  }

  async getUserNotifications(recipientId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: {
        recipientId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { sentAt: 'desc' },
    });
  }

  async markAsRead(notificationIds: string[], userId: string) {
    await this.prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        recipientId: userId,
      },
      data: { isRead: true, readAt: new Date() },
    });
    return { updated: notificationIds.length };
  }

  async generateAiPreAssessment(
    studentId: string,
    appealType: AppealType,
    semesterId: string,
    reason: string,
  ): Promise<any> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        examResults: {
          include: {
            course: true,
            courseOffering: { include: { semester: true } },
          },
        },
        enrolments: {
          where: { isDropped: false },
          include: { courseOffering: { include: { course: true } } },
        },
      },
    });

    if (!student) {
      return { error: 'Student not found for AI pre-assessment' };
    }

    const semesterGpMap: Record<string, { totalPoints: number; totalCredits: number }> = {};
    for (const result of student.examResults) {
      const semLabel = result.courseOffering.semester.label;
      if (!semesterGpMap[semLabel]) {
        semesterGpMap[semLabel] = { totalPoints: 0, totalCredits: 0 };
      }
      semesterGpMap[semLabel].totalPoints += result.gradePoint * result.course.creditHours;
      semesterGpMap[semLabel].totalCredits += result.course.creditHours;
    }

    const gpaHistory = Object.entries(semesterGpMap).map(([semester, data]) => ({
      semester,
      gpa: data.totalCredits > 0 ? Math.round((data.totalPoints / data.totalCredits) * 100) / 100 : 0,
    })).sort((a, b) => a.semester.localeCompare(b.semester));

    const currentGpa = student.cumulativeGpa;
    let gpaTrend = 'STABLE';
    if (gpaHistory.length >= 2) {
      const last = gpaHistory[gpaHistory.length - 1].gpa;
      const prev = gpaHistory[gpaHistory.length - 2].gpa;
      if (last > prev + 0.1) gpaTrend = 'UPWARD';
      else if (last < prev - 0.1) gpaTrend = 'DOWNWARD';
    }

    let recommendation: 'APPROVE' | 'REJECT' | 'CONDITIONAL' = 'CONDITIONAL';
    let reasoning = '';
    let academicRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';

    if (appealType === AppealType.CREDIT_OVERLOAD) {
      if (currentGpa >= 3.5) {
        recommendation = 'APPROVE';
        academicRisk = 'LOW';
        reasoning = `Excellent academic standing (CGPA: ${currentGpa.toFixed(2)}) with a ${gpaTrend.toLowerCase()} trend. Student has a high probability of successfully handling the requested credit overload.`;
      } else if (currentGpa >= 3.0) {
        recommendation = 'CONDITIONAL';
        academicRisk = 'MEDIUM';
        reasoning = `Good academic standing (CGPA: ${currentGpa.toFixed(2)}). Approval is recommended conditional on close monitoring, as the GPA trend is ${gpaTrend.toLowerCase()}.`;
      } else {
        recommendation = 'REJECT';
        academicRisk = 'HIGH';
        reasoning = `Student's academic standing (CGPA: ${currentGpa.toFixed(2)}) is below the recommended threshold of 3.0 for credit overloading. Current trend is ${gpaTrend.toLowerCase()}.`;
      }
    } else if (appealType === AppealType.PREREQUISITE_WAIVER) {
      if (currentGpa >= 3.25) {
        recommendation = 'APPROVE';
        academicRisk = 'LOW';
        reasoning = `Strong academic performance (CGPA: ${currentGpa.toFixed(2)}) suggests the student can handle the course complexity despite missing prerequisites.`;
      } else if (currentGpa >= 2.5) {
        recommendation = 'CONDITIONAL';
        academicRisk = 'MEDIUM';
        reasoning = `Moderate academic performance (CGPA: ${currentGpa.toFixed(2)}). Recommend conditional approval with tutor support.`;
      } else {
        recommendation = 'REJECT';
        academicRisk = 'HIGH';
        reasoning = `Weak academic performance (CGPA: ${currentGpa.toFixed(2)}) makes waiving prerequisites a high academic risk.`;
      }
    } else {
      recommendation = 'APPROVE';
      academicRisk = 'LOW';
      reasoning = `Standard appeal type ${appealType} evaluated. Academic standing is acceptable (CGPA: ${currentGpa.toFixed(2)}).`;
    }

    return {
      recommendation,
      academicRisk,
      reasoning,
      gpaTrend,
      currentGpa,
      gpaHistory,
      calculatedAt: new Date().toISOString(),
    };
  }

  async createAppeal(
    studentId: string,
    appealType: AppealType,
    semesterId: string,
    reason: string,
    supportingDocuments: string[],
    aiAssessment?: any,
  ) {
    const finalAiAssessment = aiAssessment || await this.generateAiPreAssessment(studentId, appealType, semesterId, reason);
    const appeal = await this.prisma.appeal.create({
      data: {
        studentId,
        appealType,
        semesterId,
        reason,
        supportingDocuments,
        aiAssessment: finalAiAssessment,
        status: AppealStatus.AI_REVIEWED,
      },
    });

    await this.sendNotification(
      studentId,
      NotificationChannel.IN_APP,
      'Appeal Submitted',
      `Your ${appealType} appeal has been submitted and is pending review.`,
    );

    const programme = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { programme: { include: { faculty: true } } },
    });

    const pcUsers = await this.prisma.user.findMany({
      where: {
        role: { in: [UserRole.PROGRAMME_COORDINATOR, UserRole.HEAD_OF_PROGRAMME] },
        isActive: true,
      },
    });

    for (const pcUser of pcUsers) {
      await this.sendNotification(
        pcUser.id,
        NotificationChannel.IN_APP,
        'New Appeal Requires Review',
        `A ${appealType} appeal has been submitted by a student in ${programme?.programme?.name || 'your programme'}.`,
        { appealId: appeal.id },
      );
    }

    return appeal;
  }

  async reviewAppeal(appealId: string, reviewerId: string, status: AppealStatus, comments?: string) {
    const existingAppeal = await this.prisma.appeal.findUnique({
      where: { id: appealId },
      include: { student: true },
    });

    if (!existingAppeal) {
      throw new NotFoundException('Appeal not found');
    }

    const appeal = await this.prisma.appeal.update({
      where: { id: appealId },
      data: {
        status,
        reviewedBy: reviewerId,
        updatedAt: new Date(),
      },
    });

    await this.sendNotification(
      appeal.studentId,
      NotificationChannel.IN_APP,
      'Appeal Status Updated',
      `Your appeal has been ${status.toLowerCase().replace(/_/g, ' ')}.`,
    );

    return appeal;
  }

  async getStudentAppeals(studentId: string) {
    return this.prisma.appeal.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingAppeals() {
    return this.prisma.appeal.findMany({
      where: { status: { in: [AppealStatus.PENDING, AppealStatus.AI_REVIEWED, AppealStatus.PC_REVIEWED] } },
      include: { student: { include: { user: true, programme: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getNotificationTemplates() {
    return this.prisma.notificationTemplate.findMany({
      orderBy: { code: 'asc' },
    });
  }

  async createNotificationTemplate(code: string, title: string, body: string, channel: NotificationChannel, description?: string) {
    return this.prisma.notificationTemplate.create({
      data: {
        code,
        title,
        body,
        channel,
        description,
      },
    });
  }
}