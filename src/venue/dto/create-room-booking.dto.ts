import { IsString, IsDateString, IsOptional, IsEnum } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class CreateRoomBookingDto {
  @IsString()
  roomId: string;

  @IsDateString()
  date: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsString()
  purpose: string;

  @IsString()
  bookedBy: string;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}