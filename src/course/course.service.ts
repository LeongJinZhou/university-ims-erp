import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreatePrerequisiteDto } from './dto/create-prerequisite.dto';
import { CreateEquivalencyDto } from './dto/create-equivalency.dto';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  async createCourse(dto: CreateCourseDto) {
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
    return this.prisma.courseEquivalency.create({
      data: {
        ...dto,
        isDeliveryMerge: dto.isDeliveryMerge ?? true,
      },
    });
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

  async verifyPrerequisites(courseId: string, completedCourseIds: string[]): Promise<{ eligible: boolean; missing: string[] }> {
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

  async getPrerequisiteGraph(courseId: string, visited: Set<string> = new Set(), path: string[] = []): Promise<any> {
    if (visited.has(courseId)) {
      return { cycle: true, path: [...path, courseId] };
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
        this.getPrerequisiteGraph(prereq.prerequisiteCourseId, new Set(visited), [...path])
      )
    );

    return {
      courseId,
      code: course.code,
      name: course.name,
      prerequisites: prereqNodes,
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