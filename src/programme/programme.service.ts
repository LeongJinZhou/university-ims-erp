import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { CreateProgrammeDto } from './dto/create-programme.dto';
import { CreateProgrammeVersionDto } from './dto/create-programme-version.dto';
import { CreateMqaSemesterPlanDto } from './dto/create-semester-plan.dto';

@Injectable()
export class ProgrammeService {
  constructor(private prisma: PrismaService) {}

  async getAllProgrammes() {
    return this.prisma.programme.findMany({
      include: { faculty: true, versions: true },
    });
  }

  async createDepartment(dto: CreateDepartmentDto) {
    const existing = await this.prisma.department.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Department code already exists');
    return this.prisma.department.create({ data: dto });
  }

  async createFaculty(dto: CreateFacultyDto) {
    const existing = await this.prisma.faculty.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Faculty code already exists');
    return this.prisma.faculty.create({ data: dto });
  }

  async createProgramme(dto: CreateProgrammeDto) {
    const existing = await this.prisma.programme.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Programme code already exists');
    return this.prisma.programme.create({ data: dto });
  }

  async createProgrammeVersion(dto: CreateProgrammeVersionDto) {
    const existing = await this.prisma.programmeVersion.findUnique({
      where: { programmeId_version: { programmeId: dto.programmeId, version: dto.version } },
    });
    if (existing) throw new ConflictException('Programme version already exists');
    return this.prisma.programmeVersion.create({ data: dto });
  }

  async createMqaSemesterPlan(dto: CreateMqaSemesterPlanDto) {
    const plan = await this.prisma.mqaSemesterPlan.create({
      data: {
        programmeVersionId: dto.programmeVersionId,
        semesterNumber: dto.semesterNumber,
        totalCredits: dto.totalCredits,
      },
    });
    if (dto.courses && dto.courses.length > 0) {
      await this.prisma.mqaPlanCourse.createMany({
        data: dto.courses.map((c) => ({
          semesterPlanId: plan.id,
          courseId: c.courseId,
          isElective: c.isElective || false,
        })),
      });
    }
    return plan;
  }

  async getProgrammeWithVersions(code: string) {
    const programme = await this.prisma.programme.findUnique({
      where: { code },
      include: { versions: true },
    });
    if (!programme) throw new NotFoundException('Programme not found');
    return programme;
  }

  async getVersionWithPlans(versionId: string) {
    const version = await this.prisma.programmeVersion.findUnique({
      where: { id: versionId },
      include: {
        semesterPlans: { include: { courses: { include: { course: true } } } },
      },
    });
    if (!version) throw new NotFoundException('Programme version not found');
    return version;
  }

  async getAllFaculties() {
    return this.prisma.faculty.findMany({ include: { programmes: true } });
  }

  async getAllDepartments() {
    return this.prisma.department.findMany({ include: { programmes: true } });
  }

  async getProgrammesByFaculty(facultyCode: string) {
    return this.prisma.programme.findMany({
      where: { faculty: { code: facultyCode } },
      include: { versions: true },
    });
  }

  async getSemesterPlan(semesterNumber: number, programmeVersionId: string) {
    return this.prisma.mqaSemesterPlan.findFirst({
      where: { semesterNumber, programmeVersionId },
      include: { courses: { include: { course: true } } },
    });
  }
}