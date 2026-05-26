import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateRoomBookingDto } from './dto/create-room-booking.dto';

export interface ReplacementSlot {
  slotId?: string;
  roomId: string;
  venueId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  disruptionScore: number;
}

@Injectable()
export class VenueService {
  constructor(private prisma: PrismaService) {}

  async getAllVenues() {
    return this.prisma.venue.findMany({ include: { rooms: true } });
  }

  async createVenue(dto: CreateVenueDto) {
    return this.prisma.venue.create({ data: dto });
  }

  async createRoom(dto: CreateRoomDto) {
    return this.prisma.room.create({
      data: {
        ...dto,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async createRoomBooking(dto: CreateRoomBookingDto) {
    const conflicts = await this.prisma.roomBooking.findMany({
      where: {
        roomId: dto.roomId,
        date: new Date(dto.date),
        status: 'CONFIRMED',
        OR: [
          { startTime: { lte: dto.startTime }, endTime: { gte: dto.startTime } },
          { startTime: { lte: dto.endTime }, endTime: { gte: dto.endTime } },
        ],
      },
    });

    if (conflicts.length > 0) {
      throw new BadRequestException('Room already booked for this time');
    }

    return this.prisma.roomBooking.create({ data: { ...dto, date: new Date(dto.date) } });
  }

  async findAvailableRooms(
    date: string,
    startTime: string,
    endTime: string,
    minCapacity: number = 0,
  ): Promise<any[]> {
    const rooms = await this.prisma.room.findMany({
      where: {
        isActive: true,
        capacity: { gte: minCapacity },
      },
      include: { venue: true },
    });

    const availableRooms = [];

    for (const room of rooms) {
      const conflicts = await this.prisma.roomBooking.findMany({
        where: {
          roomId: room.id,
          date: new Date(date),
          status: 'CONFIRMED',
          OR: [
            { startTime: { lte: startTime }, endTime: { gte: startTime } },
            { startTime: { lte: endTime }, endTime: { gte: endTime } },
          ],
        },
      });

      if (conflicts.length === 0) {
        availableRooms.push(room);
      }
    }

    return availableRooms;
  }

  async findReplacementSlots(
    cancelledSlotId: string,
    courseOfferingId: string,
  ): Promise<ReplacementSlot[]> {
    const cancelledSlot = await this.prisma.timetableSlot.findUnique({
      where: { id: cancelledSlotId },
      include: { courseOffering: { include: { course: true } } },
    });

    if (!cancelledSlot) {
      throw new NotFoundException('Cancelled slot not found');
    }

    const enrolmentCount = await this.prisma.enrolment.count({
      where: { courseOfferingId },
    });

    const candidateSlots = await this.prisma.timetableSlot.findMany({
      where: {
        dayOfWeek: cancelledSlot.dayOfWeek,
        OR: [
          { startTime: { lte: cancelledSlot.endTime }, endTime: { gte: cancelledSlot.endTime } },
          { startTime: { lte: cancelledSlot.startTime }, endTime: { gte: cancelledSlot.startTime } },
        ],
      },
      include: { venue: true },
    });

    const replacements: ReplacementSlot[] = candidateSlots.map((slot) => {
      const disruptionScore = this.calculateDisruptionScore(
        enrolmentCount,
        slot,
        cancelledSlot,
      );

      return {
        slotId: slot.id,
        roomId: slot.venueId,
        venueId: '',
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        disruptionScore,
      };
    });

    return replacements.sort((a, b) => a.disruptionScore - b.disruptionScore);
  }

  private calculateDisruptionScore(
    enrolmentCount: number,
    candidateSlot: any,
    originalSlot: any,
  ): number {
    let score = 0;

    if (candidateSlot.dayOfWeek !== originalSlot.dayOfWeek) {
      score += 100;
    }

    const timeDiff = Math.abs(
      this.timeToMinutes(candidateSlot.startTime) -
        this.timeToMinutes(originalSlot.startTime)
    );
    score += timeDiff;

    score += enrolmentCount * 0.1;

    return Math.round(score);
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }

  async scheduleMaintenance(
    roomId: string,
    startDate: Date,
    endDate: Date,
    reason: string,
    scheduledBy: string,
  ) {
    return this.prisma.maintenanceBlock.create({
      data: {
        roomId,
        startDate,
        endDate,
        reason,
        scheduledBy,
      },
    });
  }

  async getMaintenanceConflicts(roomId: string, date: Date): Promise<any[]> {
    return this.prisma.maintenanceBlock.findMany({
      where: {
        roomId,
        startDate: { lte: date },
        endDate: { gte: date },
      },
    });
  }
}