import { Injectable, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreatePrerequisiteDto } from './dto/create-prerequisite.dto';
import { CreateEquivalencyDto } from './dto/create-equivalency.dto';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async createCourse(dto: CreateCourseDto) {
    const programme = await this.prisma.programme.findUnique({
      where: { id: dto.programmeId },
    });

    if (!programme) {
      throw new NotFoundException('Programme not found');
    }

    if (programme.calendarType === 'STANDARD') {
      const maxCredits = 20;
      if (dto.creditHours > maxCredits) {
        throw new BadRequestException(
          `Course credit hours (${dto.creditHours}) exceed standard semester maximum (${maxCredits})`
        );
      }
    }

    return this.prisma.course.create({
      data: {
        ...dto,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async getCourse(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        programme: true,
        prerequisites: { include: { prerequisiteCourse: true } },
        prerequisiteFor: { include: { course: true } },
        equivalenciesA: { include: { courseB: true } },
        equivalenciesB: { include: { courseA: true } },
      },
    });
  }

  async getCoursesByProgramme(programmeId: string) {
    return this.prisma.course.findMany({
      where: { programmeId },
      include: {
        prerequisites: true,
        equivalenciesA: true,
        equivalenciesB: true,
      },
    });
  }

  async createPrerequisite(dto: CreatePrerequisiteDto) {
    const existing = await this.prisma.prerequisite.findFirst({
      where: {
        courseId: dto.courseId,
        prerequisiteCourseId: dto.prerequisiteCourseId,
      },
    });

    if (existing) {
      throw new ConflictException('Prerequisite already defined for this course');
    }

    return this.prisma.prerequisite.create({
      data: {
        ...dto,
        isMandatory: dto.isMandatory ?? true,
      },
    });
  }

  async removePrerequisite(courseId: string, prerequisiteCourseId: string) {
    return this.prisma.prerequisite.deleteMany({
      where: { courseId, prerequisiteCourseId },
    });
  }

  async createEquivalency(dto: CreateEquivalencyDto) {
    try {
      return await this.prisma.courseEquivalency.create({
        data: {
          ...dto,
          isDeliveryMerge: dto.isDeliveryMerge ?? true,
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Equivalency already defined between these courses');
      }
      throw error;
    }
  }

  async removeEquivalency(courseAId: string, courseBId: string) {
    return this.prisma.courseEquivalency.deleteMany({
      where: { OR: [{ courseAId, courseBId }, { courseAId: courseBId, courseBId: courseAId }] },
    });
  }

  async getEquivalencies(courseId: string) {
    const equivalencies = await this.prisma.courseEquivalency.findMany({
      where: { OR: [{ courseAId: courseId }, { courseBId: courseId }] },
      include: {
        courseA: true,
        courseB: true,
      },
    });

    return equivalencies.map(eq => ({
      ...eq,
      equivalentCourse: eq.courseAId === courseId ? eq.courseB : eq.courseA,
    }));
  }

  async verifyPrerequisites(
    courseId: string,
    completedCourseIds: string[],
    checkCycles: boolean = true
  ): Promise<{ eligible: boolean; missing: string[]; cycles?: string[] }> {
    if (checkCycles) {
      const { hasCycle, cyclePath } = await this.detectPrerequisiteCycle(courseId);
      if (hasCycle) {
        return { eligible: false, missing: [], cycles: cyclePath };
      }
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { prerequisites: true },
    });

    if (!course) {
      return { eligible: false, missing: [] };
    }

    const missingPrerequisites = course.prerequisites
      .filter(prereq => !completedCourseIds.includes(prereq.prerequisiteCourseId))
      .map(prereq => prereq.prerequisiteCourseId);

    return {
      eligible: missingPrerequisites.length === 0,
      missing: missingPrerequisites,
    };
  }

  async detectPrerequisiteCycle(courseId: string, visited: Set<string> = new Set(), path: string[] = []): Promise<{ hasCycle: boolean; cyclePath: string[] }> {
    if (visited.has(courseId)) {
      const cycleStart = path.indexOf(courseId);
      return { hasCycle: true, cyclePath: [...path.slice(cycleStart), courseId] };
    }

    visited.add(courseId);
    path.push(courseId);

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { prerequisites: true },
    });

    if (!course) {
      return { hasCycle: false, cyclePath: [] };
    }

    for (const prereq of course.prerequisites) {
      const result = await this.detectPrerequisiteCycle(prereq.prerequisiteCourseId, visited, path);
      if (result.hasCycle) {
        return result;
      }
    }

    path.pop();
    return { hasCycle: false, cyclePath: [] };
  }

  async getPrerequisiteGraph(courseId: string, visited: Set<string> = new Set(), path: string[] = []): Promise<any> {
    if (visited.has(courseId)) {
      return { cycle: true, courseId, path: [...path, courseId] };
    }

    visited.add(courseId);
    path.push(courseId);

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { prerequisites: true },
    });

    if (!course) {
      return { cycle: false, prerequisites: [] };
    }

    const prereqNodes = await Promise.all(
      course.prerequisites.map(prereq =>
        this.getPrerequisiteGraph(prereq.prerequisiteCourseId, visited, path)
      )
    );

    const hasCycle = prereqNodes.some((n: any) => n.cycle);
    path.pop();

    return {
      courseId,
      code: course.code,
      name: course.name,
      prerequisites: prereqNodes,
      hasCycle,
    };
  }

  async checkCourseMergeEligibility(courseAId: string, courseBId: string): Promise<{ canMerge: boolean; reason?: string }> {
    const equivalency = await this.prisma.courseEquivalency.findFirst({
      where: {
        OR: [
          { courseAId, courseBId },
          { courseAId: courseBId, courseBId: courseAId },
        ],
      },
    });

    if (!equivalency) {
      return { canMerge: false, reason: 'No equivalency mapping exists between courses' };
    }

    if (!equivalency.isDeliveryMerge) {
      return { canMerge: false, reason: 'Courses are equivalent but delivery merge is disabled' };
    }

    return { canMerge: true };
  }
}