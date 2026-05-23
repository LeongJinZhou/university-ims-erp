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
    jest.clearAllMocks();
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
      mockPrismaService.course.findUnique.mockReset();

      const courseA = { id: 'course-a', code: 'COMP101', name: 'Intro to Programming', prerequisites: [{ prerequisiteCourseId: 'course-b' }] };
      const courseB = { id: 'course-b', code: 'COMP102', name: 'Data Structures', prerequisites: [] };

      mockPrismaService.course.findUnique
        .mockResolvedValueOnce(courseA)
        .mockResolvedValueOnce(courseB);

      const result = await service.detectPrerequisiteCycle('course-a');

      expect(result.hasCycle).toBe(false);
      expect(result.cyclePath).toEqual([]);
    });

    it('should not report false positives from independent branches', async () => {
      const courseA = { id: 'course-a', prerequisites: [{ prerequisiteCourseId: 'course-b' }] };
      const courseB = { id: 'course-b', prerequisites: [] };
      const courseC = { id: 'course-c', prerequisites: [{ prerequisiteCourseId: 'course-b' }] };

      mockPrismaService.course.findUnique
        .mockImplementationOnce(() => Promise.resolve(courseA))
        .mockImplementationOnce(() => Promise.resolve(courseB))
        .mockImplementationOnce(() => Promise.resolve(courseC))
        .mockImplementationOnce(() => Promise.resolve(courseB));

      const result = await service.detectPrerequisiteCycle('course-a');

      expect(result.hasCycle).toBe(false);
    });
  });

  describe('createCourse credit-hour validation', () => {
    it('should reject credit hours exceeding standard limit', async () => {
      mockPrismaService.programme.findUnique.mockResolvedValue({
        id: 'prog-1',
        calendarType: 'STANDARD',
      });

      await expect(service.createCourse({
        code: 'TEST101',
        name: 'Test Course',
        creditHours: 25,
        courseType: 'THEORY',
        programmeId: 'prog-1',
      })).rejects.toThrow('Course credit hours (25) exceed standard semester maximum (20)');
    });

    it('should accept credit hours within standard limit', async () => {
      mockPrismaService.programme.findUnique.mockResolvedValue({
        id: 'prog-1',
        calendarType: 'STANDARD',
      });
      mockPrismaService.course.create.mockResolvedValue({ id: 'course-1' });

      const result = await service.createCourse({
        code: 'TEST101',
        name: 'Test Course',
        creditHours: 18,
        courseType: 'THEORY',
        programmeId: 'prog-1',
      });

      expect(result).toBeDefined();
    });
  });

  describe('createEquivalency conflict handling', () => {
    it('should throw ConflictException for duplicate equivalency', async () => {
      const prismaError: any = new Error('Unique constraint');
      prismaError.code = 'P2002';
      mockPrismaService.courseEquivalency.create.mockRejectedValue(prismaError);

      await expect(service.createEquivalency({
        courseAId: 'course-a',
        courseBId: 'course-b',
      })).rejects.toThrow('Equivalency already defined between these courses');
    });
  });
});