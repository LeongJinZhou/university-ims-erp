import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { CreateCourseOfferingDto } from './dto/create-course-offering.dto';
import { CreateTimetableSlotDto } from './dto/create-timetable-slot.dto';

@Injectable()
export class TimetableService {
  constructor(private prisma: PrismaService) {}

  async createSemester(dto: CreateSemesterDto) {
    return this.prisma.semester.create({
      data: {
        ...dto,
        isActive: dto.isActive ?? false,
      },
    });
  }

  async createCourseOffering(dto: CreateCourseOfferingDto) {
    return this.prisma.courseOffering.create({
      data: {
        ...dto,
        currentEnrolment: dto.currentEnrolment ?? 0,
        isConfirmed: dto.isConfirmed ?? false,
      },
    });
  }

  async validateNoDoubleBooking(
    lecturerId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeSlotId?: string,
  ): Promise<boolean> {
    const overlappingSlots = await this.prisma.timetableSlot.findMany({
      where: {
        id: excludeSlotId ? { not: excludeSlotId } : undefined,
        dayOfWeek,
        OR: [
          { startTime: { lte: startTime }, endTime: { gte: startTime } },
          { startTime: { lte: endTime }, endTime: { gte: endTime } },
          { startTime: { gte: startTime }, endTime: { lte: endTime } },
        ],
        courseOffering: {
          lecturerId,
        },
      },
    });

    if (overlappingSlots.length > 0) {
      throw new ConflictException(
        `Lecturer already booked at ${startTime}-${endTime} on day ${dayOfWeek}`
      );
    }

    return true;
  }

  async validateRoomCapacity(
    venueId: string,
    courseOfferingId: string,
    isMergedClass: boolean = false,
  ): Promise<boolean> {
    const venue = await this.prisma.room.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      throw new BadRequestException('Venue not found');
    }

    const offering = await this.prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
      include: { sections: true },
    });

    if (!offering) {
      throw new BadRequestException('Course offering not found');
    }

    const headcount = isMergedClass
      ? offering.sections.reduce((sum, s) => sum + (s.combinedHeadcount || 0), 0)
      : offering.currentEnrolment;

    if (headcount > venue.capacity) {
      throw new ConflictException(
        `Room capacity (${venue.capacity}) exceeded by ${headcount} students`
      );
    }

    return true;
  }

  async createTimetableSlot(dto: CreateTimetableSlotDto) {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id: dto.courseOfferingId },
      include: { lecturer: true },
    });

    if (!offering) {
      throw new BadRequestException('Course offering not found');
    }

    await this.validateNoDoubleBooking(
      offering.lecturerId,
      dto.dayOfWeek,
      dto.startTime,
      dto.endTime,
    );

    await this.validateRoomCapacity(dto.venueId, dto.courseOfferingId, dto.isMergedClass);

    return this.prisma.timetableSlot.create({
      data: {
        ...dto,
        isMergedClass: dto.isMergedClass ?? false,
      },
    });
  }

  async generateDraftTimetable(semesterId: string): Promise<any> {
    const offerings = await this.prisma.courseOffering.findMany({
      where: { semesterId },
      include: {
        course: true,
        lecturer: true,
        sections: true,
      },
    });

    const constraints = {
      noLecturerConflicts: true,
      roomCapacity: true,
      mergedClasses: await this.getMergedEquivalencies(),
    };

    return {
      semesterId,
      offerings,
      constraints,
      status: 'draft',
    };
  }

  private async getMergedEquivalencies(): Promise<any[]> {
    return this.prisma.courseEquivalency.findMany({
      where: { isDeliveryMerge: true },
    });
  }

  async approveTimetable(timetableId: string, approverId: string): Promise<any> {
    const timetable = await this.prisma.timetable.findUnique({
      where: { id: timetableId },
      include: { slots: true },
    });

    if (!timetable) {
      throw new BadRequestException('Timetable not found');
    }

    if (timetable.approvalState === 'APPROVED') {
      return timetable;
    }

    return this.prisma.timetable.update({
      where: { id: timetableId },
      data: {
        approvalState: 'PENDING_PC',
        approvedBy: approverId,
        approvedAt: new Date(),
      },
    });
  }
}