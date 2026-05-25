import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { AuditEventListener } from './audit-event.listener';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, AuditEventListener, AnalyticsService, PrismaService],
  exports: [NotificationService, AnalyticsService],
})
export class NotificationModule {}