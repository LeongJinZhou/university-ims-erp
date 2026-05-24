import { Controller, Get, Post, Body, Query, Patch, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationChannel, AppealStatus, AppealType } from '@prisma/client';

@Controller('notifications')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  @Get()
  async getUserNotifications(@Query('userId') userId: string, @Query('unreadOnly') unreadOnly?: string) {
    return this.notificationService.getUserNotifications(userId, unreadOnly === 'true');
  }

  @Patch('read')
  async markAsRead(@Body('notificationIds') notificationIds: string[], @Body('userId') userId: string) {
    return this.notificationService.markAsRead(notificationIds, userId);
  }

  @Post('appeal')
  async createAppeal(
    @Body('studentId') studentId: string,
    @Body('appealType') appealType: AppealType,
    @Body('semesterId') semesterId: string,
    @Body('reason') reason: string,
    @Body('supportingDocuments') supportingDocuments: string[],
    @Body('aiAssessment') aiAssessment?: any,
  ) {
    return this.notificationService.createAppeal(
      studentId,
      appealType,
      semesterId,
      reason,
      supportingDocuments,
      aiAssessment,
    );
  }

  @Get('appeals')
  async getStudentAppeals(@Query('studentId') studentId?: string) {
    if (studentId) {
      return this.notificationService.getStudentAppeals(studentId);
    }
    return this.notificationService.getPendingAppeals();
  }

  @Patch('appeals/:id/review')
  async reviewAppeal(
    @Param('id') appealId: string,
    @Body('reviewerId') reviewerId: string,
    @Body('status') status: AppealStatus,
    @Body('comments') comments?: string,
  ) {
    return this.notificationService.reviewAppeal(appealId, reviewerId, status, comments);
  }

  @Get('templates')
  async getNotificationTemplates() {
    return this.notificationService.getNotificationTemplates();
  }

  @Post('templates')
  async createNotificationTemplate(
    @Body('code') code: string,
    @Body('title') title: string,
    @Body('body') body: string,
    @Body('channel') channel: NotificationChannel,
    @Body('description') description?: string,
  ) {
    return this.notificationService.createNotificationTemplate(code, title, body, channel, description);
  }
}