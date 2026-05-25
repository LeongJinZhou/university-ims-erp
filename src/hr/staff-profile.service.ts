import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmploymentType } from '@prisma/client';

@Injectable()
export class StaffProfileService {
  constructor(private prisma: PrismaService) {}

  async createStaffProfile(data: {
    userId: string;
    staffId: string;
    departmentId?: string;
    position: string;
    employmentType?: EmploymentType;
    salary?: number;
    bankAccount?: string;
    emergencyContact?: string;
    qualifications?: string[];
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.staffProfile.findFirst({
      where: { OR: [{ userId: data.userId }, { staffId: data.staffId }] },
    });

    if (existing) {
      throw new ConflictException('Staff profile already exists for this user or staff ID');
    }

    return this.prisma.staffProfile.create({
      data: {
        userId: data.userId,
        staffId: data.staffId,
        departmentId: data.departmentId,
        position: data.position,
        employmentType: data.employmentType || 'FULL_TIME',
        salary: data.salary,
        bankAccount: data.bankAccount,
        emergencyContact: data.emergencyContact,
        qualifications: data.qualifications || [],
      },
      include: { user: true, department: true },
    });
  }

  async getStaffProfile(id: string) {
    const profile = await this.prisma.staffProfile.findUnique({
      where: { id },
      include: { user: true, department: true },
    });

    if (!profile) {
      throw new NotFoundException('Staff profile not found');
    }

    return profile;
  }

  async getAllStaffProfiles() {
    return this.prisma.staffProfile.findMany({
      include: { user: true, department: true },
    });
  }

  async updateStaffProfile(id: string, data: {
    position?: string;
    departmentId?: string;
    employmentType?: EmploymentType;
    salary?: number;
    bankAccount?: string;
    emergencyContact?: string;
    qualifications?: string[];
  }) {
    const profile = await this.prisma.staffProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Staff profile not found');
    }

    return this.prisma.staffProfile.update({
      where: { id },
      data,
      include: { user: true, department: true },
    });
  }

  async deleteStaffProfile(id: string) {
    const profile = await this.prisma.staffProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Staff profile not found');
    }

    return this.prisma.staffProfile.delete({
      where: { id },
    });
  }
}