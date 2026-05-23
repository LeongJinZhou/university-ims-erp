import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto } from './dto/create-student.dto';

export interface StudyPlanView {
  studentId: string;
  currentSemester: number;
  planStatus: string;
  projectedGraduation?: string;
  semesters: SemesterPlanView[];
  atRiskFlags?: AtRiskFlag[];
}

export interface SemesterPlanView {
  semesterNumber: number;
  calendarSemester: string;
  totalCredits: number;
  courses: CoursePlanView[];
}

export interface CoursePlanView {
  courseId: string;
  courseCode: string;
  courseName: string;
  creditHours: number;
  isRetake: boolean;
  isDeferred: boolean;
  gradeStatus?: string;
}

export interface AtRiskFlag {
  type: 'LOW_CREDITS' | 'HIGH_DROP_RATE' | 'GPA_DECLINE' | 'EXTENSION_RISK' | 'EXCEEDS_MAX_CREDITS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
}

type SemesterType = 'LONG' | 'SHORT';

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  private getSemesterType(calendarSemester: string): SemesterType {
    const month = parseInt(calendarSemester.substring(4, 6));
    if (month >= 11 || month <= 4) return 'LONG';
    return 'SHORT';
  }

  private getMaxCredits(semesterType: SemesterType): number {
    return semesterType === 'LONG' ? 20 : 10;
  }

  private validateIntakeAnchor(intakeYear: number, intakePeriod: 'APRIL' | 'JULY' | 'OCTOBER'): string {
    const validPeriods = ['APRIL', 'JULY', 'OCTOBER'];
    if (!validPeriods.includes(intakePeriod)) {
      throw new BadRequestException(`Invalid intake period: ${intakePeriod}. Must be one of ${validPeriods.join(', ')}`);
    }
    return `${intakeYear}${intakePeriod.charAt(0)}${intakePeriod.charAt(1)}${intakePeriod.charAt(2)}`;
  }

@Injectable()
export class StudentService {
  constructor(private prisma: PrismaService) {}

  async createStudent(dto: CreateStudentDto) {
    const [user, programme, programmeVersion] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: dto.userId } }),
      this.prisma.programme.findUnique({ where: { id: dto.programmeId } }),
      this.prisma.programmeVersion.findUnique({ where: { id: dto.programmeVersionId } }),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!programme) {
      throw new NotFoundException('Programme not found');
    }
    if (!programmeVersion) {
      throw new NotFoundException('Programme version not found');
    }

    const intakeAnchor = this.validateIntakeAnchor(dto.intakeYear, dto.intakePeriod);

    return this.prisma.student.create({
      data: {
        userId: dto.userId,
        studentId: dto.studentId,
        programmeId: dto.programmeId,
        programmeVersionId: dto.programmeVersionId,
        intakePeriod: dto.intakePeriod,
        intakeYear: dto.intakeYear,
        intakeAnchor,
      },
    });
  }

  async getStudent(id: string) {
    return this.prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        programme: { include: { faculty: true } },
        programmeVersion: true,
        academicPlan: { include: { semesters: { include: { plannedCourses: true } } } },
        enrolments: { include: { courseOffering: { include: { course: true } } } },
        examResults: { include: { courseOffering: { include: { course: true } } } },
      },
    });
  }

  async getStudyPlanView(studentId: string, format: 'detailed' | 'summary' = 'detailed'): Promise<StudyPlanView> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
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
        examResults: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (!student.academicPlan) {
      throw new NotFoundException('Academic plan not found for student');
    }

    const semesters = student.academicPlan.semesters.map((sp) => {
      const semesterType = this.getSemesterType(sp.calendarSemester);
      const maxCredits = this.getMaxCredits(semesterType);
      const exceedingCredits = sp.totalCredits > maxCredits;

      return {
        semesterNumber: sp.semesterNumber,
        calendarSemester: sp.calendarSemester,
        totalCredits: sp.totalCredits,
        courses: sp.plannedCourses.map((pc) => ({
          courseId: pc.courseId,
          courseCode: pc.courseCode,
          courseName: '',
          creditHours: pc.creditHours,
          isRetake: pc.isRetake,
          isDeferred: pc.isDeferred,
          gradeStatus: pc.gradeStatus || undefined,
        })),
        ...(exceedingCredits && { creditLimitWarning: `Exceeds ${maxCredits} credit limit for ${semesterType.toLowerCase()} semester` }),
      };
    });

    const atRiskFlags = await this.detectAtRisk(student.id);

    return {
      studentId: student.studentId,
      currentSemester: student.currentSemester,
      planStatus: student.planStatus,
      projectedGraduation: student.projectedGraduation || undefined,
      semesters,
      atRiskFlags: atRiskFlags.length > 0 ? atRiskFlags : undefined,
    };
  }

  async detectAtRisk(studentId: string): Promise<AtRiskFlag[]> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrolments: true,
        examResults: true,
        dropRequests: true,
        academicPlan: {
          include: {
            semesters: {
              include: {
                plannedCourses: true,
              },
            },
          },
        },
      },
    });

    if (!student) {
      return [];
    }

    const flags: AtRiskFlag[] = [];

    const currentEnrolments = student.enrolments.filter(e => !e.isDropped);
    const totalCredits = await this.calculateCurrentSemesterCredits(student.id);

    if (totalCredits < 12) {
      flags.push({
        type: 'LOW_CREDITS',
        severity: totalCredits < 6 ? 'HIGH' : 'MEDIUM',
        message: `Current semester credits (${totalCredits}) below minimum threshold (12)`,
      });
    }

    const dropRate = student.enrolments.length > 0
      ? student.enrolments.filter(e => e.isDropped).length / student.enrolments.length
      : 0;

    if (dropRate > 0.3) {
      flags.push({
        type: 'HIGH_DROP_RATE',
        severity: dropRate > 0.5 ? 'HIGH' : 'MEDIUM',
        message: `Drop rate (${Math.round(dropRate * 100)}%) exceeds normal threshold`,
      });
    }

    if (student.cumulativeGpa > 0 && student.cumulativeGpa < 2.0) {
      flags.push({
        type: 'GPA_DECLINE',
        severity: student.cumulativeGpa < 1.5 ? 'HIGH' : 'MEDIUM',
        message: `Cumulative GPA (${student.cumulativeGpa.toFixed(2)}) indicates academic difficulty`,
      });
    }

    const pendingDrops = student.dropRequests.filter(d => d.status === 'PENDING').length;
    if (pendingDrops > 2) {
      flags.push({
        type: 'EXTENSION_RISK',
        severity: 'MEDIUM',
        message: `Multiple pending drop requests (${pendingDrops}) may affect graduation timeline`,
      });
    }

    const maxCredits = this.calculateMaxCreditsForCurrentSemester(student);
    if (totalCredits > maxCredits) {
      const semesterType = maxCredits === 20 ? 'long' : 'short';
      flags.push({
        type: 'EXCEEDS_MAX_CREDITS',
        severity: 'HIGH',
        message: `Current semester credits (${totalCredits}) exceed maximum for ${semesterType} semester (${maxCredits})`,
      });
    }

    return flags;
  }

  private calculateMaxCreditsForCurrentSemester(student: {
    intakeAnchor: string;
    currentSemester: number;
    academicPlan?: {
      semesters: { calendarSemester: string; totalCredits: number }[];
    };
  }): number {
    const intakeMonth = parseInt(student.intakeAnchor.substring(4, 6));
    const semesterOffset = student.currentSemester - 1;
    const currentMonth = ((intakeMonth - 1 + semesterOffset * 4) % 12) + 1;
    const semesterType = this.getSemesterType(`${student.intakeAnchor.substring(0, 4)}${String(currentMonth).padStart(2, '0')}`);
    return this.getMaxCredits(semesterType);
  }
  }

  private async calculateCurrentSemesterCredits(studentId: string): Promise<number> {
    const enrolments = await this.prisma.enrolment.findMany({
      where: { studentId, isDropped: false },
      include: { courseOffering: { include: { course: true } } },
    });

    return enrolments.reduce((sum, e) => sum + (e.courseOffering?.course?.creditHours || 0), 0);
  }

  async getStudentProfile(studentId: string) {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        programme: true,
        examResults: true,
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

    const totalCredits = student.totalCreditsEarned;
    const creditsThisSemester = await this.calculateCurrentSemesterCredits(studentId);
    const atRiskFlags = await this.detectAtRisk(studentId);

    return {
      ...student,
      totalCredits,
      currentSemesterCredits: creditsThisSemester,
      atRiskFlags,
    };
  }
}