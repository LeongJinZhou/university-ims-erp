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

  async createAppeal(
    studentId: string,
    appealType: AppealType,
    semesterId: string,
    reason: string,
    supportingDocuments: string[],
    aiAssessment?: any,
  ) {
    const appeal = await this.prisma.appeal.create({
      data: {
        studentId,
        appealType,
        semesterId,
        reason,
        supportingDocuments,
        aiAssessment: aiAssessment || {},
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