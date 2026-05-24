import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { SetAvailabilityDto } from './dto/set-availability.dto';

export interface TeachingLoad {
  lecturerId: string;
  lecturerName: string;
  contractType: string;
  maxTeachingLoad: number;
  currentCredits: number;
  currentCourses: number;
  remainingCapacity: number;
  semesterId: string;
}

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  async createLecturer(dto: CreateLecturerDto) {
    const { userId, staffId, facultyId, departmentId, contractType, maxTeachingLoad } = dto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const existing = await this.prisma.lecturer.findFirst({
      where: { OR: [{ userId }, { staffId }] },
    });

    if (existing) {
      throw new ConflictException('Lecturer record already exists for this user or staff ID');
    }

    return this.prisma.lecturer.create({
      data: {
        userId,
        staffId,
        facultyId,
        departmentId,
        contractType,
        maxTeachingLoad,
      },
      include: { user: true, faculty: true, department: true },
    });
  }

  async getLecturer(lecturerId: string) {
    const lecturer = await this.prisma.lecturer.findUnique({
      where: { id: lecturerId },
      include: {
        user: true,
        faculty: true,
        department: true,
        availability: true,
        leaveRecords: true,
        performanceReviews: true,
      },
    });

    if (!lecturer) {
      throw new NotFoundException('Lecturer not found');
    }

    return lecturer;
  }

  async getAllLecturers() {
    return this.prisma.lecturer.findMany({
      where: { isActive: true },
      include: { user: true, faculty: true, department: true },
    });
  }

  async setAvailability(dto: SetAvailabilityDto) {
    const { lecturerId, semesterId, availableDays, preferredStartTime, preferredEndTime, maxConsecutiveHours } = dto;

    const lecturer = await this.prisma.lecturer.findUnique({
      where: { id: lecturerId },
    });

    if (!lecturer) {
      throw new NotFoundException('Lecturer not found');
    }

    return this.prisma.lecturerAvailability.upsert({
      where: { lecturerId_semesterId: { lecturerId, semesterId } },
      update: {
        availableDays,
        preferredStartTime,
        preferredEndTime,
        maxConsecutiveHours,
      },
      create: {
        lecturerId,
        semesterId,
        availableDays,
        preferredStartTime: preferredStartTime || '08:00',
        preferredEndTime: preferredEndTime || '18:00',
        maxConsecutiveHours: maxConsecutiveHours || 2,
      },
    });
  }

  async getTeachingLoads(semesterId: string): Promise<TeachingLoad[]> {
    const offerings = await this.prisma.courseOffering.findMany({
      where: { semesterId },
      include: { lecturer: { include: { user: true } }, course: true },
    });

    const loadMap = new Map<string, TeachingLoad>();

    for (const offering of offerings) {
      const lecturerId = offering.lecturerId;
      const credits = offering.course.creditHours;

      if (!loadMap.has(lecturerId)) {
        loadMap.set(lecturerId, {
          lecturerId,
          lecturerName: `${offering.lecturer?.user?.name || 'Unknown'}`,
          contractType: offering.lecturer?.contractType || 'FULL_TIME',
          maxTeachingLoad: offering.lecturer?.maxTeachingLoad || 12,
          currentCredits: 0,
          currentCourses: 0,
          remainingCapacity: 0,
          semesterId,
        });
      }

      const load = loadMap.get(lecturerId)!;
      load.currentCredits += credits;
      load.currentCourses += 1;
    }

    const loads = Array.from(loadMap.values());
    return loads.map((l) => ({
      ...l,
      remainingCapacity: Math.max(0, l.maxTeachingLoad - l.currentCredits),
    }));
  }

  async getTimetableData(semesterId: string) {
    const offerings = await this.prisma.courseOffering.findMany({
      where: { semesterId },
      include: {
        lecturer: { include: { user: true } },
        course: true,
        timetableSlots: true,
      },
    });

    return offerings.map((o) => ({
      courseCode: o.course.code,
      courseName: o.course.name,
      lecturerName: o.lecturer?.user?.name,
      lecturerId: o.lecturerId,
      slots: o.timetableSlots.map((s) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
    }));
  }

  async getLecturerAvailability(lecturerId: string, semesterId: string) {
    const availability = await this.prisma.lecturerAvailability.findUnique({
      where: { lecturerId_semesterId: { lecturerId, semesterId } },
    });

    if (!availability) {
      throw new NotFoundException('Availability not set for this semester');
    }

    return availability;
  }
}