import { Test, TestingModule } from '@nestjs/testing';
import { CourseService } from './course.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CourseService', () => {
  let service: CourseService;

  const mockPrismaService = {
    programme: {
      findUnique: jest.fn(),
    },
    course: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    prerequisite: {
      findFirst: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    courseEquivalency: {
      create: jest.fn(),
      deleteMany: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
  });

  describe('detectPrerequisiteCycle', () => {
    it('should detect a circular prerequisite chain', async () => {
      const courseA = { id: 'course-a', code: 'COMP101', name: 'Intro to Programming', prerequisites: [{ prerequisiteCourseId: 'course-b' }] };
      const courseB = { id: 'course-b', code: 'COMP102', name: 'Data Structures', prerequisites: [{ prerequisiteCourseId: 'course-a' }] };

      mockPrismaService.course.findUnique
        .mockImplementationOnce(() => Promise.resolve(courseA))
        .mockImplementationOnce(() => Promise.resolve(courseB))
        .mockImplementationOnce(() => Promise.resolve(courseA));

      const result = await service.detectPrerequisiteCycle('course-a');

      expect(result.hasCycle).toBe(true);
      expect(result.cyclePath).toContain('course-a');
      expect(result.cyclePath).toContain('course-b');
    });

    it('should return no cycle for linear prerequisite chain', async () => {
      const courseA = { id: 'course-a', code: 'COMP101', name: 'Intro to Programming', prerequisites: [{ prerequisiteCourseId: 'course-b' }] };
      const courseB = { id: 'course-b', code: 'COMP102', name: 'Data Structures', prerequisites: [] };

      mockPrismaService.course.findUnique
        .mockImplementationOnce(() => Promise.resolve(courseA))
        .mockImplementationOnce(() => Promise.resolve(courseB));

      const result = await service.detectPrerequisiteCycle('course-a');

      expect(result.hasCycle).toBe(false);
      expect(result.cyclePath).toEqual([]);
    });
  });
});