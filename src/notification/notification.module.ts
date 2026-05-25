import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { AuditEventListener } from './audit-event.listener';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, AuditEventListener, PrismaService],
  exports: [NotificationService],
})
export class NotificationModule {}