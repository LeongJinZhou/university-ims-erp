import { Injectable, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrolCourseDto } from './dto/enrol-course.dto';
import { CreateDropRequestDto } from './dto/create-drop-request.dto';
import { SemesterType } from '@prisma/client';

export interface PrerequisiteImpact {
  courseCode: string;
  courseName: string;
  semester: string;
  status: 'BLOCKED' | 'AT_RISK' | 'CLEAR';
  reason: string;
}

export interface AiImpactPreview {
  totalCreditsAfter: number;
  creditCapExceeded: boolean;
  maxAllowedCredits: number;
  prerequisiteImpacts: PrerequisiteImpact[];
  recommendation: 'PROCEED' | 'CAUTION' | 'BLOCK';
  calculatedAt: Date;
}

@Injectable()
export class EnrolmentService {
  constructor(private prisma: PrismaService) {}

  async enrolCourse(dto: EnrolCourseDto) {
    const { studentId, courseOfferingId, sectionCode } = dto;

    const offering = await this.prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
      include: { course: true, semester: true },
    });

    if (!offering) {
      throw new BadRequestException('Course offering not found');
    }

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: { programme: true },
    });

    if (!student) {
      throw new BadRequestException('Student not found');
    }

    const existing = await this.prisma.enrolment.findUnique({
      where: { studentId_courseOfferingId: { studentId, courseOfferingId } },
    });

    if (existing && !existing.isDropped) {
      throw new ConflictException('Already enrolled in this course');
    }

    const currentEnrolments = await this.prisma.enrolment.findMany({
      where: { studentId, isDropped: false },
      include: { courseOffering: { include: { course: true } } },
    });

    const currentCredits = currentEnrolments.reduce(
      (sum, e) => sum + (e.courseOffering?.course?.creditHours ?? 0),
      0
    );

    const maxCredits = offering.semester.semesterType === SemesterType.LONG ? 20 : 10;

    await this.validatePrerequisites(studentId, courseOfferingId);
    await this.validateCreditCap(currentCredits + offering.course.creditHours, maxCredits);
    await this.validateNoTimeConflict(studentId, offering.id);

    const section = sectionCode
      ? await this.prisma.section.findFirst({
          where: { courseOfferingId: offering.id, sectionCode },
        })
      : await this.prisma.section.findFirst({
          where: { courseOfferingId: offering.id },
          orderBy: { sectionCode: 'asc' },
        });

    if (!section) {
      throw new BadRequestException('No available section for this course');
    }

    return this.prisma.enrolment.create({
      data: {
        studentId,
        semesterId: offering.semesterId,
        courseOfferingId,
        sectionId: section.id,
      },
    });
  }

  async validateCreditCap(totalCredits: number, maxCredits: number): Promise<void> {
    if (totalCredits > maxCredits) {
      throw new ConflictException(
        `Credit limit exceeded: ${totalCredits} credits requested, max allowed is ${maxCredits}`
      );
    }
  }

  async validatePrerequisites(studentId: string, courseOfferingId: string): Promise<void> {
    const offering = await this.prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
      include: { course: { include: { prerequisites: { include: { prerequisiteCourse: true } } } } },
    });

    if (!offering) {
      throw new BadRequestException('Course offering not found');
    }

    const studentResults = await this.prisma.examResult.findMany({
      where: { studentId },
    });

    const passedCourses = new Set(
      studentResults.filter((r) => r.gradeStatus === 'PASS').map((r) => r.courseId)
    );

    for (const prereq of offering.course.prerequisites) {
      if (prereq.isMandatory && !passedCourses.has(prereq.prerequisiteCourseId)) {
        throw new ForbiddenException(
          `Missing prerequisite: ${prereq.prerequisiteCourse.code} - ${prereq.prerequisiteCourse.name}`
        );
      }
    }
  }

  async validateNoTimeConflict(studentId: string, newOfferingId: string): Promise<void> {
    const newOffering = await this.prisma.courseOffering.findUnique({
      where: { id: newOfferingId },
      include: { timetableSlots: true },
    });

    if (!newOffering?.timetableSlots.length) {
      return;
    }

    const existingEnrolments = await this.prisma.enrolment.findMany({
      where: { studentId, isDropped: false },
      include: { courseOffering: { include: { timetableSlots: true, course: true } } },
    });

    for (const enrolment of existingEnrolments) {
      for (const existingSlot of enrolment.courseOffering.timetableSlots) {
        for (const newSlot of newOffering.timetableSlots) {
          if (existingSlot.dayOfWeek === newSlot.dayOfWeek) {
            const overlaps =
              (existingSlot.startTime < newSlot.endTime && existingSlot.endTime > newSlot.startTime) ||
              (newSlot.startTime < existingSlot.endTime && newSlot.endTime > existingSlot.startTime);

            if (overlaps) {
              throw new ConflictException(
                `Time conflict with ${enrolment.courseOffering.course?.code} on day ${newSlot.dayOfWeek}`
              );
            }
          }
        }
      }
    }
  }

  async generateDropImpactPreview(studentId: string, enrolmentId: string): Promise<AiImpactPreview> {
    const enrolment = await this.prisma.enrolment.findUnique({
      where: { id: enrolmentId },
      include: {
        student: true,
        courseOffering: { include: { course: true, semester: true } },
      },
    });

    if (!enrolment) {
      throw new BadRequestException('Enrolment not found');
    }

    if (enrolment.studentId !== studentId) {
      throw new ForbiddenException('Not authorized to drop this enrolment');
    }

    const currentEnrolments = await this.prisma.enrolment.findMany({
      where: { studentId, isDropped: false },
      include: { courseOffering: { include: { course: true } } },
    });

    const droppedCredits = enrolment.courseOffering?.course?.creditHours ?? 0;
    const currentCredits = currentEnrolments.reduce(
      (sum, e) => sum + (e.courseOffering?.course?.creditHours ?? 0),
      0
    );

    const maxCredits = enrolment.courseOffering?.semester?.semesterType === SemesterType.LONG ? 20 : 10;

    const impacts = await this.analyzePrerequisiteImpacts(studentId, enrolment);

    const recommendation = impacts.some((i) => i.status === 'BLOCKED') ? 'BLOCK' :
                           impacts.some((i) => i.status === 'AT_RISK') ? 'CAUTION' : 'PROCEED';

    return {
      totalCreditsAfter: currentCredits - droppedCredits,
      creditCapExceeded: false,
      maxAllowedCredits: maxCredits,
      prerequisiteImpacts: impacts,
      recommendation,
      calculatedAt: new Date(),
    };
  }

  private async analyzePrerequisiteImpacts(
    studentId: string,
    enrolment: any
  ): Promise<PrerequisiteImpact[]> {
    const impacts: PrerequisiteImpact[] = [];
    const courseCode = enrolment.courseOffering?.course?.code ?? '';

    const futureEnrolments = await this.prisma.enrolment.findMany({
      where: { studentId, isDropped: false },
      include: { courseOffering: { include: { course: { include: { prerequisites: true } }, semester: true } } },
    });

    const studentResults = await this.prisma.examResult.findMany({
      where: { studentId },
    });

    const passedCourses = new Set(
      studentResults.filter((r) => r.gradeStatus === 'PASS').map((r) => r.courseId)
    );

    for (const enrol of futureEnrolments) {
      const course = enrol.courseOffering?.course;
      if (!course) continue;

      for (const prereq of course.prerequisites) {
        if (prereq.prerequisiteCourseId === enrolment.courseOffering?.courseId) {
          const status = passedCourses.has(course.id) ? 'CLEAR' :
                        await this.checkAlternativePath(studentId, prereq.prerequisiteCourseId) ? 'CLEAR' : 'AT_RISK';

          impacts.push({
            courseCode: course.code,
            courseName: course.name,
            semester: enrol.courseOffering?.semester?.label ?? '',
            status,
            reason: status === 'AT_RISK' ? `Requires ${courseCode} as prerequisite` : 'Alternative path available',
          });
        }
      }
    }

    return impacts;
  }

  private async checkAlternativePath(studentId: string, requiredCourseId: string): Promise<boolean> {
    const equivalencies = await this.prisma.courseEquivalency.findMany({
      where: { OR: [{ courseAId: requiredCourseId }, { courseBId: requiredCourseId } ] },
    });

    const studentResults = await this.prisma.examResult.findMany({
      where: { studentId, gradeStatus: 'PASS' },
    });

    const passedCourseIds = new Set(studentResults.map((r) => r.courseId));

    return equivalencies.some((eq) =>
      passedCourseIds.has(eq.courseAId) || passedCourseIds.has(eq.courseBId)
    );
  }

  async createDropRequest(dto: CreateDropRequestDto) {
    const { studentId, enrolmentId, reason } = dto;

    const enrolment = await this.prisma.enrolment.findUnique({
      where: { id: enrolmentId },
    });

    if (!enrolment || enrolment.studentId !== studentId) {
      throw new BadRequestException('Invalid enrolment');
    }

    if (enrolment.isDropped) {
      throw new BadRequestException('Already dropped');
    }

    const aiPreview = await this.generateDropImpactPreview(studentId, enrolmentId);

    return this.prisma.dropRequest.create({
      data: {
        studentId,
        enrolmentId,
        courseCode: enrolment.courseOfferingId,
        reason,
        aiImpactPreview: aiPreview as any,
      },
    });
  }

  async processDropRequest(dropRequestId: string, action: 'APPROVE' | 'REJECT'): Promise<any> {
    const request = await this.prisma.dropRequest.findUnique({
      where: { id: dropRequestId },
    });

    if (!request) {
      throw new BadRequestException('Drop request not found');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException('Request already processed');
    }

    const status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';

    const updated = await this.prisma.dropRequest.update({
      where: { id: dropRequestId },
      data: { status },
    });

    if (action === 'APPROVE') {
      await this.prisma.enrolment.update({
        where: { id: request.enrolmentId },
        data: { isDropped: true, droppedAt: new Date() },
      });
    }

    return updated;
  }

  async getStudentEnrolments(studentId: string) {
    return this.prisma.enrolment.findMany({
      where: { studentId, isDropped: false },
      include: {
        courseOffering: { include: { course: true, semester: true } },
        section: true,
      },
    });
  }

  async checkCreditEligibility(studentId: string, semesterId: string): Promise<{
    eligible: boolean;
    currentCredits: number;
    maxCredits: number;
    remainingCredits: number;
  }> {
    const semester = await this.prisma.semester.findUnique({
      where: { id: semesterId },
    });

    if (!semester) {
      throw new BadRequestException('Semester not found');
    }

    const enrolments = await this.prisma.enrolment.findMany({
      where: { studentId, semesterId, isDropped: false },
      include: { courseOffering: { include: { course: true } } },
    });

    const currentCredits = enrolments.reduce(
      (sum, e) => sum + (e.courseOffering?.course?.creditHours ?? 0),
      0
    );

    const maxCredits = semester.semesterType === SemesterType.LONG ? 20 : 10;

    return {
      eligible: currentCredits <= maxCredits,
      currentCredits,
      maxCredits,
      remainingCredits: maxCredits - currentCredits,
    };
  }
}