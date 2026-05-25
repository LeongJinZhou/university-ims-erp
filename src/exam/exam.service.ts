import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRetakePlanDto } from './dto/create-retake-plan.dto';

type SemesterType = 'LONG' | 'SHORT';

interface FailedCourse {
  courseId: string;
  courseCode: string;
  courseName: string;
  creditHours: number;
  failedSemester: string;
}

interface PlannedCourseWithPrereqs {
  id: string;
  courseId: string;
  courseCode: string;
  creditHours: number;
  isRetake: boolean;
  isDeferred: boolean;
}

@Injectable()
export class ExamService {
  constructor(private prisma: PrismaService) {}

  private getSemesterType(calendarSemester: string): SemesterType {
    const [year, month] = calendarSemester.split('-').map(Number);
    if (month >= 11 || month <= 4) return 'LONG';
    return 'SHORT';
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
              include: {
                plannedCourses: {
                  include: {
                    semesterPlan: true,
                  },
                },
              },
            },
          },
        },
        programme: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const failedCourses = await this.identifyFailedCourses(student.id);
    if (failedCourses.length === 0) {
      throw new BadRequestException('No failed courses to retake');
    }

    await this.updateRetakeBacklog(student.id, failedCourses);

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

    await this.cascadeRetakes(
      {
        id: student.id,
        currentSemester: student.currentSemester,
        intakeAnchor: student.intakeAnchor,
        programme: { maxDurationSemesters: student.programme.maxDurationSemesters },
        academicPlan: student.academicPlan as any,
      },
      retakePlan.id,
      failedCourses,
    );

    return retakePlan;
  }

  private async updateRetakeBacklog(studentId: string, failedCourses: FailedCourse[]) {
    for (const fc of failedCourses) {
      await this.prisma.retakeBacklog.upsert({
        where: {
          studentId_courseId_failedSemester: {
            studentId,
            courseId: fc.courseId,
            failedSemester: fc.failedSemester,
          },
        },
        update: { status: 'PENDING' },
        create: {
          studentId,
          courseId: fc.courseId,
          courseCode: fc.courseCode,
          creditHours: fc.creditHours,
          failedSemester: fc.failedSemester,
        },
      });
    }
  }

  private async identifyFailedCourses(studentId: string): Promise<FailedCourse[]> {
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
      academicPlan?: { semesters: { semesterNumber: number; calendarSemester: string; plannedCourses: { courseId: string; isDeferred: boolean }[] }[] };
    },
    retakePlanId: string,
    failedCourses: FailedCourse[],
  ) {
    let revisions: { semesterNumber: number; calendarSemester: string; addedCourses: string[]; deferredCourses: string[]; totalCredits: number }[] = [];

    let remainingFailed = [...failedCourses];
    let currentSemesterNum = student.currentSemester + 1;
    let requiresExtension = false;
    let extensionSemester: { semesterNumber: number; calendarSemester: string; maxCredits: number } | null = null;

    while (remainingFailed.length > 0) {
      const semInfo = this.calculateNextSemester(student.intakeAnchor, currentSemesterNum);
      const semLabel = this.getCalendarSemesterLabel(semInfo.year, semInfo.month);

      const plannedSemester = student.academicPlan?.semesters.find((s) => s.semesterNumber === currentSemesterNum);
      const mqaPlannedCourses = plannedSemester?.plannedCourses.filter((pc) => !pc.isRetake) || [];

      const deferrableCourse = this.findDeferrableCourse(mqaPlannedCourses, student.intakeAnchor, currentSemesterNum);

      const retakableCourses = remainingFailed.filter((fc) => fc.creditHours <= semInfo.maxCredits);
      let toRetake: typeof retakableCourses = [];
      let totalRetakeCredits = 0;

      for (const fc of retakableCourses) {
        if (totalRetakeCredits + fc.creditHours <= semInfo.maxCredits) {
          toRetake.push(fc);
          totalRetakeCredits += fc.creditHours;
        } else {
          break;
        }
      }

      let deferredCourses: string[] = [];
      let deferredCredits = 0;
      let totalCredits = totalRetakeCredits;

      if (deferrableCourse && remainingFailed.length > 0) {
        const remainingSpace = semInfo.maxCredits - totalCredits;
        if (remainingSpace > 0) {
          deferredCourses = [deferrableCourse.courseId];
          deferredCredits = deferrableCourse.creditHours;
          totalCredits += deferredCredits;
        }
      }

      remainingFailed = remainingFailed.filter((fc) => !toRetake.includes(fc));

      if (toRetake.length > 0 || deferredCourses.length > 0) {
        revisions.push({
          semesterNumber: currentSemesterNum,
          calendarSemester: semLabel,
          addedCourses: toRetake.map((c) => c.courseId),
          deferredCourses,
          totalCredits,
        });
      }

      currentSemesterNum++;

      if (currentSemesterNum > student.programme.maxDurationSemesters) {
        const nextSemInfo = this.calculateNextSemester(student.intakeAnchor, currentSemesterNum);
        extensionSemester = {
          semesterNumber: currentSemesterNum,
          calendarSemester: this.getCalendarSemesterLabel(nextSemInfo.year, nextSemInfo.month),
          maxCredits: nextSemInfo.maxCredits,
        };
        requiresExtension = true;
        break;
      }
    }

    await this.prisma.retakeSemesterRevision.createMany({
      data: revisions.map((r) => ({ ...r, retakePlanId })),
    });

    if (requiresExtension && extensionSemester && remainingFailed.length > 0) {
      await this.createExtensionSemester(retakePlanId, remainingFailed, extensionSemester);
    }

    if (requiresExtension) {
      await this.prisma.student.update({
        where: { id: student.id },
        data: { planStatus: 'EXTENSION_REQUIRED' },
      });
    }

    const projectedGraduation = remainingFailed.length > 0 ? extensionSemester?.calendarSemester : revisions[revisions.length - 1]?.calendarSemester;
    if (projectedGraduation) {
      await this.prisma.retakePlan.update({
        where: { id: retakePlanId },
        data: { projectedGraduation },
      });
    }
  }

  private findDeferrableCourse(
    plannedCourses: PlannedCourseWithPrereqs[],
    intakeAnchor: string,
    currentSemester: number,
  ): { courseId: string; creditHours: number } | null {
    for (const pc of plannedCourses) {
      const prereqs = this.getPrerequisites(pc.courseId);
      const isNeededByOthers = this.isPrerequisiteForFuture(pc.courseId, plannedCourses, currentSemester);

      if (!isNeededByOthers && prereqs.every((prereq) => this.isPrereqSatisfied(prereq, plannedCourses, currentSemester))) {
        return { courseId: pc.courseId, creditHours: pc.creditHours };
      }
    }
    return null;
  }

  private getPrerequisites(courseId: string): string[] {
    return [];
  }

  private isPrerequisiteForFuture(courseId: string, plannedCourses: PlannedCourseWithPrereqs[], currentSemester: number): boolean {
    return false;
  }

  private isPrereqSatisfied(prereqId: string, plannedCourses: PlannedCourseWithPrereqs[], currentSemester: number): boolean {
    return true;
  }

  private async createExtensionSemester(
    retakePlanId: string,
    remainingFailed: { courseId: string; creditHours: number }[],
    extSemester: { semesterNumber: number; calendarSemester: string; maxCredits: number },
  ) {
    const totalCredits = remainingFailed.reduce((sum, c) => sum + c.creditHours, 0);

    await this.prisma.retakeSemesterRevision.create({
      data: {
        retakePlanId,
        semesterNumber: extSemester.semesterNumber,
        calendarSemester: extSemester.calendarSemester,
        addedCourses: remainingFailed.map((c) => c.courseId),
        deferredCourses: [],
        totalCredits,
      },
    });

    await this.prisma.appeal.create({
      data: {
        studentId: (await this.prisma.retakePlan.findUnique({ where: { id: retakePlanId } }))!.studentId,
        appealType: 'EXTENSION_SEMESTER',
        semesterId: extSemester.calendarSemester,
        reason: `Extension semester required to complete ${remainingFailed.length} failed course(s). ${totalCredits} credits scheduled.`,
      },
    });
  }

  async recordExamResult(studentId: string, courseOfferingId: string, grade: string, marks?: number) {
    const courseOffering = await this.prisma.courseOffering.findUnique({
      where: { id: courseOfferingId },
      include: { course: true, semester: true },
    });

    if (!courseOffering) {
      throw new NotFoundException('Course offering not found');
    }

    const gradePoint = this.calculateGradePoint(grade);
    const gradeStatus = this.determineGradeStatus(grade);

    const examResult = await this.prisma.examResult.create({
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

    await this.prisma.grade.create({
      data: {
        studentId,
        courseId: courseOffering.courseId,
        examResultId: examResult.id,
        attemptNumber: 1,
        grade,
        gradePoint,
        creditHours: courseOffering.course.creditHours,
        isRetakeAttempt: false,
        recordedBy: '',
      },
    });

    return examResult;
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

  async getGraduationCompleteness(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        programme: {
          include: {
            versions: {
              where: { isActive: true },
              include: {
                semesterPlans: {
                  include: {
                    courses: {
                      include: {
                        course: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        examResults: true,
        retakeBacklog: true,
        enrolments: {
          include: {
            courseOffering: {
              include: { course: true },
            },
          },
        },
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const programmeVersion = student.programme.versions[0];
    const mqaPlan = programmeVersion.semesterPlans;
    const completedCourses = new Set(student.examResults.filter((r) => r.gradeStatus === 'PASS').map((r) => r.courseId));
    const failedCourses = new Set(student.examResults.filter((r) => r.gradeStatus === 'FAIL').map((r) => r.courseId));
    const retakeScheduled = new Set(student.retakeBacklog.filter((r) => r.status === 'SCHEDULED').map((r) => r.courseId));

    const requiredCourses = mqaPlan.flatMap((sp) => sp.courses.map((c) => c.courseId));
    const missingCourses = requiredCourses.filter((c) => !completedCourses.has(c));
    const totalRequiredCredits = requiredCourses.reduce((sum, c) => {
      const course = mqaPlan.flatMap((sp) => sp.courses).find((x) => x.courseId === c)?.course;
      return sum + (course?.creditHours || 0);
    }, 0);

    const earnedCredits = student.examResults
      .filter((r) => r.gradeStatus === 'PASS')
      .reduce((sum, r) => sum + (r.marks || 0), 0);

    return {
      studentId: student.studentId,
      programme: student.programme.name,
      totalRequiredCredits,
      earnedCredits,
      remainingCredits: totalRequiredCredits - earnedCredits,
      failedCoursesCount: failedCourses.size,
      retakeScheduledCount: retakeScheduled.size,
      missingCoursesCount: missingCourses.length,
      isGraduationReady: missingCourses.length === 0 && student.retakeBacklog.filter((r) => r.status === 'PENDING').length === 0,
      checklist: {
        allRequiredCoursesCompleted: missingCourses.length === 0,
        noPendingRetakes: student.retakeBacklog.filter((r) => r.status === 'PENDING').length === 0,
        creditsSatisfied: earnedCredits >= totalRequiredCredits,
        gpaMet: student.cumulativeGpa >= 2.0,
        noExtensionRequired: student.planStatus !== 'EXTENSION_REQUIRED',
      },
    };
  }
}