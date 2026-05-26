import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { CreateCourseOfferingDto } from './dto/create-course-offering.dto';
import { CreateTimetableSlotDto } from './dto/create-timetable-slot.dto';
import { ApprovalState, SemesterType } from '@prisma/client';

@Injectable()
export class TimetableService {
  constructor(private prisma: PrismaService) {}

  async getAllSlots() {
    return this.prisma.timetableSlot.findMany({
      include: {
        courseOffering: { include: { course: true, lecturer: { include: { user: true } } } },
        venue: true,
      },
    });
  }

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

  async approveTimetable(
    timetableId: string,
    approverId: string,
    role: 'PC' | 'HOP' = 'PC',
  ): Promise<any> {
    const timetable = await this.prisma.timetable.findUnique({
      where: { id: timetableId },
    });

    if (!timetable) {
      throw new BadRequestException('Timetable not found');
    }

    const current = timetable.approvalState;

    if (current === 'APPROVED') {
      return timetable;
    }

    let next: ApprovalState;

    if (current === 'DRAFT' && role === 'PC') {
      next = 'PENDING_PC';
    } else if (current === 'PENDING_PC' && role === 'HOP') {
      next = 'PENDING_HOP';
    } else if (current === 'PENDING_HOP' && role === 'HOP') {
      next = 'APPROVED';
    } else {
      throw new BadRequestException(
        `Invalid approval transition from ${current} for role ${role}`
      );
    }

    return this.prisma.timetable.update({
      where: { id: timetableId },
      data: {
        approvalState: next,
        approvedBy: approverId,
        approvedAt: new Date(),
      },
    });
  }

  async validateSemesterCreditLimits(semesterId: string): Promise<void> {
    const semester = await this.prisma.semester.findUnique({
      where: { id: semesterId },
    });

    if (!semester) {
      throw new BadRequestException('Semester not found');
    }

    const maxCredits = semester.semesterType === SemesterType.LONG ? 20 : 10;

    const offerings = await this.prisma.courseOffering.findMany({
      where: { semesterId, isConfirmed: true },
      include: { course: true },
    });

    const totalCredits = offerings.reduce(
      (sum, o) => sum + (o.course?.creditHours ?? 0),
      0
    );

    if (totalCredits > maxCredits) {
      throw new ConflictException(
        `Total credits (${totalCredits}) exceed semester limit (${maxCredits})`
      );
    }
  }

  async solveTimetable(dto: { semesterId: string; offeringIds?: string[]; useMergeLogic?: boolean }) {
    const offerings = await this.prisma.courseOffering.findMany({
      where: { semesterId: dto.semesterId },
      include: {
        course: true,
        lecturer: true,
        sections: true,
      },
    });

    const rooms = await this.prisma.room.findMany({
      include: { equipment: true },
    });

    const lecturerAvailability = await this.prisma.lecturerAvailability.findMany({
      where: { semesterId: dto.semesterId },
    });

    const solverPayload = {
      semesterId: dto.semesterId,
      offerings: offerings.map(o => ({
        id: o.id,
        courseId: o.courseId,
        courseCode: o.course?.code,
        courseName: o.course?.name,
        creditHours: o.course?.creditHours,
        courseType: o.course?.courseType,
        lecturerId: o.lecturerId,
        maxCapacity: o.maxCapacity,
        currentEnrolment: o.currentEnrolment,
        prerequisites: [],
      })),
      rooms: rooms.map(r => ({
        id: r.id,
        code: r.code,
        capacity: r.capacity,
        building: '',
        floor: r.floorPlanX ? 0 : 0,
        equipment: r.equipment?.map(e => e.type) || [],
      })),
      lecturers: await this.prisma.lecturer.findMany({
        where: { id: { in: offerings.map(o => o.lecturerId) } },
        include: { user: true },
      }).then(ls => ls.map(l => ({
        id: l.id,
        name: l.user?.name || '',
        maxTeachingLoad: l.maxTeachingLoad,
        availableDays: lecturerAvailability.find(a => a.lecturerId === l.id)?.availableDays || [0,1,2,3,4],
        preferredStartTime: lecturerAvailability.find(a => a.lecturerId === l.id)?.preferredStartTime || '08:00',
        preferredEndTime: lecturerAvailability.find(a => a.lecturerId === l.id)?.preferredEndTime || '18:00',
      }))),
      studentGroups: [{ id: dto.semesterId, programmeId: '', studentCount: 0, enrolments: [] }],
      timeSlots: Array.from({ length: 5 }, (_, d) => ({
        dayOfWeek: d,
        startTime: '08:00',
        endTime: '10:00',
      })),
    };

    return solverPayload;
  }

  async mergeCourses(body: { courseAId: string; courseBId: string; semesterId: string }) {
    const equivalency = await this.prisma.courseEquivalency.findFirst({
      where: {
        OR: [
          { courseAId: body.courseAId, courseBId: body.courseBId },
          { courseAId: body.courseBId, courseBId: body.courseAId },
        ],
        isDeliveryMerge: true,
      },
    });

    if (!equivalency) {
      throw new BadRequestException('Courses are not marked as mergeable');
    }

    return { success: true, equivalencyId: equivalency.id };
  }
}