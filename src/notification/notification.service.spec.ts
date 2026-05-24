import { Test, TestingModule } from '@nestjs/testing';
import { NotificationService } from './notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppealType, AppealStatus } from '@prisma/client';

describe('NotificationService AI Pre-Assessment', () => {
  let service: NotificationService;

  const mockPrismaService = {
    student: {
      findUnique: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    appeal: {
      create: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
  });

  describe('generateAiPreAssessment', () => {
    it('should recommend APPROVE for CREDIT_OVERLOAD when CGPA is >= 3.5', async () => {
      const mockStudent = {
        id: 'student-1',
        cumulativeGpa: 3.8,
        examResults: [
          {
            gradePoint: 4.0,
            course: { creditHours: 3 },
            courseOffering: { semester: { label: '2025-S1' } },
          },
          {
            gradePoint: 3.7,
            course: { creditHours: 3 },
            courseOffering: { semester: { label: '2025-S2' } },
          },
        ],
        enrolments: [],
      };

      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);

      const result = await service.generateAiPreAssessment(
        'student-1',
        AppealType.CREDIT_OVERLOAD,
        'semester-1',
        'Reason'
      );

      expect(result.recommendation).toBe('APPROVE');
      expect(result.academicRisk).toBe('LOW');
      expect(result.currentGpa).toBe(3.8);
      expect(result.gpaTrend).toBe('DOWNWARD'); // 4.0 in S1, 3.7 in S2
    });

    it('should recommend CONDITIONAL for CREDIT_OVERLOAD when CGPA is between 3.0 and 3.5', async () => {
      const mockStudent = {
        id: 'student-2',
        cumulativeGpa: 3.2,
        examResults: [
          {
            gradePoint: 3.0,
            course: { creditHours: 3 },
            courseOffering: { semester: { label: '2025-S1' } },
          },
          {
            gradePoint: 3.3,
            course: { creditHours: 3 },
            courseOffering: { semester: { label: '2025-S2' } },
          },
        ],
        enrolments: [],
      };

      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);

      const result = await service.generateAiPreAssessment(
        'student-2',
        AppealType.CREDIT_OVERLOAD,
        'semester-1',
        'Reason'
      );

      expect(result.recommendation).toBe('CONDITIONAL');
      expect(result.academicRisk).toBe('MEDIUM');
      expect(result.gpaTrend).toBe('UPWARD'); // 3.0 to 3.3
    });

    it('should recommend REJECT for CREDIT_OVERLOAD when CGPA is < 3.0', async () => {
      const mockStudent = {
        id: 'student-3',
        cumulativeGpa: 2.7,
        examResults: [],
        enrolments: [],
      };

      mockPrismaService.student.findUnique.mockResolvedValue(mockStudent);

      const result = await service.generateAiPreAssessment(
        'student-3',
        AppealType.CREDIT_OVERLOAD,
        'semester-1',
        'Reason'
      );

      expect(result.recommendation).toBe('REJECT');
      expect(result.academicRisk).toBe('HIGH');
    });
  });
});
