import { Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { PrismaService } from '../prisma/prisma.service'

export interface AuditEvent {
  userId: string
  action: string
  entityType: string
  entityId?: string
  description?: string
  metadata?: any
  ipAddress?: string
  userAgent?: string
}

@Injectable()
export class AuditEventListener {
  private readonly logger = new Logger(AuditEventListener.name)

  constructor(private prisma: PrismaService) {}

  @OnEvent('student.created')
  async handleStudentCreated(payload: AuditEvent) {
    await this.logAuditTrail({
      ...payload,
      action: 'STUDENT_CREATED',
    })
    await this.sendNotification(payload.userId, 'Student Profile Created', 'Your student profile has been created successfully.')
  }

  @OnEvent('student.updated')
  async handleStudentUpdated(payload: AuditEvent) {
    await this.logAuditTrail({
      ...payload,
      action: 'STUDENT_UPDATED',
    })
  }

  @OnEvent('student.deleted')
  async handleStudentDeleted(payload: AuditEvent) {
    await this.logAuditTrail({
      ...payload,
      action: 'STUDENT_DELETED',
    })
  }

  @OnEvent('enrolment.created')
  async handleEnrolmentCreated(payload: AuditEvent) {
    await this.logAuditTrail({
      ...payload,
      action: 'ENROLMENT_CREATED',
    })
    await this.sendNotification(payload.userId, 'Enrolment Confirmed', 'You have been enrolled in a new course.')
  }

  @OnEvent('enrolment.dropped')
  async handleEnrolmentDropped(payload: AuditEvent) {
    await this.logAuditTrail({
      ...payload,
      action: 'ENROLMENT_DROPPED',
    })
    await this.sendNotification(payload.userId, 'Enrolment Dropped', 'Your course drop request has been processed.')
  }

  @OnEvent('timetable.approved')
  async handleTimetableApproved(payload: AuditEvent) {
    await this.logAuditTrail({
      ...payload,
      action: 'TIMETABLE_APPROVED',
    })
    await this.sendNotification(payload.userId, 'Timetable Published', 'Your semester timetable has been published.')
  }

  @OnEvent('exam.result_released')
  async handleExamResultReleased(payload: AuditEvent) {
    await this.logAuditTrail({
      ...payload,
      action: 'EXAM_RESULT_RELEASED',
    })
    await this.sendNotification(
      payload.userId,
      'Exam Results Available',
      `Results for ${payload.metadata?.courseCode || 'your exam'} are now available.`,
    )
  }

  @OnEvent('finance.invoice_generated')
  async handleInvoiceGenerated(payload: AuditEvent) {
    await this.logAuditTrail({
      ...payload,
      action: 'INVOICE_GENERATED',
    })
    await this.sendNotification(payload.userId, 'Invoice Generated', `A new invoice has been generated. Amount: ${payload.metadata?.amount || 'N/A'}`)
  }

  @OnEvent('finance.payment_received')
  async handlePaymentReceived(payload: AuditEvent) {
    await this.logAuditTrail({
      ...payload,
      action: 'PAYMENT_RECEIVED',
    })
    await this.sendNotification(payload.userId, 'Payment Received', 'Your payment has been processed successfully.')
  }

  @OnEvent('appeal.submitted')
  async handleAppealSubmitted(payload: AuditEvent) {
    await this.logAuditTrail({
      ...payload,
      action: 'APPEAL_SUBMITTED',
    })
  }

  @OnEvent('appeal.reviewed')
  async handleAppealReviewed(payload: AuditEvent) {
    await this.logAuditTrail({
      ...payload,
      action: 'APPEAL_REVIEWED',
    })
    const status = payload.metadata?.status || 'updated'
    await this.sendNotification(payload.userId, 'Appeal Reviewed', `Your appeal has been ${status}.`)
  }

  private async logAuditTrail(event: AuditEvent) {
    try {
      await this.prisma.auditTrail.create({
        data: {
          userId: event.userId,
          action: event.action,
          entityType: event.entityType,
          entityId: event.entityId,
          description: event.description,
          metadata: event.metadata,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
        },
      })
      this.logger.log(`Audit trail logged: ${event.action} by user ${event.userId}`)
    } catch (error: any) {
      this.logger.error(`Failed to log audit trail: ${error?.message || 'Unknown error'}`)
    }
  }

  private async sendNotification(userId: string, title: string, body: string) {
    try {
      await this.prisma.notification.create({
        data: {
          recipientId: userId,
          channel: 'IN_APP',
          title,
          body,
        },
      })
    } catch (error: any) {
      this.logger.error(`Failed to send notification: ${error?.message || 'Unknown error'}`)
    }
  }
}