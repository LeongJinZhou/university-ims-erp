import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRetakePlanDto } from './dto/create-retake-plan.dto';

type SemesterType = 'LONG' | 'SHORT';

@Injectable()
export class ExamService {
  constructor(private prisma: PrismaService) {}

  private getSemesterType(calendarSemester: string): SemesterType {
    const month = parseInt(calendarSemester.substring(4, 6));
    return month >= 11 || month <= 4 ? 'LONG' : 'SHORT';
  }

  private getMaxCredits(semesterType: SemesterType): number {
    return semesterType === 'LONG' ? 20 : 10;
  }

  private getCalendarSemesterLabel(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, '0')}`;
  }

  private calculateNextSemester(intakeAnchor: string, currentSemester: number): {
    year: number;
    month: number;
    semesterType: SemesterType;
    maxCredits: number;
  } {
    const intakeMonth = parseInt(intakeAnchor.substring(4, 6));
    const semesterOffset = currentSemester;
    const currentMonth = ((intakeMonth - 1 + semesterOffset * 4) % 12) + 1;
    const yearOffset = Math.floor((intakeMonth - 1 + semesterOffset * 4) / 12);
    const year = parseInt(intakeAnchor.substring(0, 4)) + yearOffset;

    const semesterType = this.getSemesterType(`${year}${String(currentMonth).padStart(2, '0')}`);
    const maxCredits = this.getMaxCredits(semesterType);

    return { year, month: currentMonth, semesterType, maxCredits };
  }

  async createRetakePlan(dto: CreateRetakePlanDto) {
    const student = await this.prisma.student.findUnique({
      where: { id: dto.studentId },
      include: {
        examResults: { where: { gradeStatus: 'FAIL' } },
        academicPlan: {
          include: {
            semesters: {
              include: { plannedCourses: true },
            },
          },
        },
        programme: { include: { maxDurationSemesters: true } },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const failedCourses = await this.identifyFailedCourses(student.id);
    if (failedCourses.length === 0) {
      throw new BadRequestException('No failed courses to retake');
    }

    const retakePlan = await this.prisma.retakePlan.create({
      data: {
        studentId: dto.studentId,
        projectedGraduation: dto.projectedGraduation,
        failedCourses: {
          create: failedCourses.map((fc) => ({
            courseId: fc.courseId,
            courseCode: fc.courseCode,
            creditHours: fc.creditHours,
            failedInSemester: fc.failedSemester,
          })),
        },
      },
    });

    await this.cascadeRetakes(student, retakePlan.id, failedCourses);

    return retakePlan;
  }

  private async identifyFailedCourses(studentId: string) {
    const results = await this.prisma.examResult.findMany({
      where: { studentId, gradeStatus: 'FAIL' },
      include: { course: true, courseOffering: { include: { semester: true } } },
    });

    return results.map((r) => ({
      courseId: r.courseId,
      courseCode: r.course.code,
      courseName: r.course.name,
      creditHours: r.course.creditHours,
      failedSemester: r.courseOffering.semester.label,
    }));
  }

  private async cascadeRetakes(
    student: {
      id: string;
      currentSemester: number;
      intakeAnchor: string;
      programme: { maxDurationSemesters: number };
      academicPlan?: { semesters: { semesterNumber: number; calendarSemester: string; plannedCourses: { isDeferred: boolean }[] }[] };
    },
    retakePlanId: string,
    failedCourses: { courseId: string; courseCode: string; creditHours: number; failedSemester: string }[],
  ) {
    const nextSemester = this.calculateNextSemester(student.intakeAnchor, student.currentSemester + 1);
    let revisions: { semesterNumber: number; calendarSemester: string; addedCourses: string[]; deferredCourses: string[]; totalCredits: number }[] = [];

    let remainingFailed = [...failedCourses];
    let currentSemester = student.currentSemester + 1;
    let availableCredits = nextSemester.maxCredits;

    while (remainingFailed.length > 0) {
      const semInfo = this.calculateNextSemester(student.intakeAnchor, currentSemester);
      const semLabel = this.getSemesterLabel(semInfo.year, semInfo.month);

      const deferredFromPlan = student.academicPlan?.semesters
        ?.find((s) => s.semesterNumber === currentSemester)?.plannedCourses.filter((pc) => pc.isDeferred)
        .map((pc) => pc.courseId) || [];

      const retakableCourses = remainingFailed.filter((fc) => fc.creditHours <= availableCredits);
      const toRetake = retakableCourses.slice(0, 4);
      remainingFailed = remainingFailed.filter((fc) => !toRetake.includes(fc));

      if (toRetake.length > 0 || deferredFromPlan.length > 0) {
        let totalCredits = toRetake.reduce((sum, c) => sum + c.creditHours, 0);
        let deferredCourses: string[] = [];

        if (deferredFromPlan.length > 0) {
          const deferredCredits = await this.getPlannedCredits(deferredFromPlan);
          if (totalCredits + deferredCredits <= semInfo.maxCredits) {
            deferredCourses = deferredFromPlan;
            totalCredits += deferredCredits;
          }
        }

        revisions.push({
          semesterNumber: currentSemester,
          calendarSemester: semLabel,
          addedCourses: toRetake.map((c) => c.courseId),
          deferredCourses,
          totalCredits,
        });
      }

      availableCredits = semInfo.maxCredits;
      currentSemester++;

      if (currentSemester > student.programme.maxDurationSemesters + 2) {
        await this.createExtensionSemester(retakePlanId, remainingFailed, currentSemester, semInfo);
        break;
      }
    }

    await this.prisma.retakeSemesterRevision.createMany({
      data: revisions.map((r) => ({
        ...r,
        retakePlanId,
      })),
    });
  }

  private async getPlannedCredits(courseIds: string[]): Promise<number> {
    const courses = await this.prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { creditHours: true },
    });
    return courses.reduce((sum, c) => sum + c.creditHours, 0);
  }

  private getSemesterLabel(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, '0')}`;
  }

  private async createExtensionSemester(
    retakePlanId: string,
    remainingFailed: { courseId: string; creditHours: number }[],
    semesterNumber: number,
    semInfo: { year: number; month: number; maxCredits: number },
  ) {
    await this.prisma.retakeSemesterRevision.create({
      data: {
        retakePlanId,
        semesterNumber,
        calendarSemester: this.getSemesterLabel(semInfo.year, semInfo.month),
        addedCourses: remainingFailed.map((c) => c.courseId),
        deferredCourses: [],
        totalCredits: remainingFailed.reduce((sum, c) => sum + c.creditHours, 0),
      },
    });
  }

  async recordExamResult(studentId: string, courseOfferingId: string, grade: string, marks?: number) {
    const courseOffering = await this.prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
      include: { course: true },
    });

    if (!courseOffering) {
      throw new NotFoundException('Course offering not found');
    }

    const gradePoint = this.calculateGradePoint(grade);
    const gradeStatus = this.determineGradeStatus(grade);

    return this.prisma.examResult.create({
      data: {
        studentId,
        courseOfferingId,
        courseId: courseOffering.courseId,
        grade,
        gradePoint,
        gradeStatus,
        marks,
        releasedBy: '',
      },
    });
  }

  private calculateGradePoint(grade: string): number {
    const gradePoints: Record<string, number> = {
      A: 4.0, 'A-': 3.7, 'B+': 3.3, B: 3.0, 'B-': 2.7, 'C+': 2.3, C: 2.0, 'C-': 1.7, D: 1.0, F: 0.0,
    };
    return gradePoints[grade] || 0;
  }

  private determineGradeStatus(grade: string): 'PASS' | 'FAIL' | 'INCOMPLETE' | 'WITHDRAWN' {
    if (grade === 'F') return 'FAIL';
    if (['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D'].includes(grade)) return 'PASS';
    return 'INCOMPLETE';
  }

  async getRetakePlan(retakePlanId: string) {
    return this.prisma.retakePlan.findUnique({
      where: { id: retakePlanId },
      include: { failedCourses: true, revisions: true },
    });
  }

  async getStudentRetakePlans(studentId: string) {
    return this.prisma.retakePlan.findMany({
      where: { studentId },
      include: { failedCourses: true, revisions: true },
    });
  }
}