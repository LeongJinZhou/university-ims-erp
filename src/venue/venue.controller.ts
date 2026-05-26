import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { VenueService } from './venue.service';
import { CreateVenueDto } from './dto/create-venue.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateRoomBookingDto } from './dto/create-room-booking.dto';

@Controller('venue')
export class VenueController {
  constructor(private readonly venueService: VenueService) {}

  @Get('venues')
  getAllVenues() {
    return this.venueService.getAllVenues();
  }

  @Post('venues')
  createVenue(@Body() dto: CreateVenueDto) {
    return this.venueService.createVenue(dto);
  }

  @Post('rooms')
  createRoom(@Body() dto: CreateRoomDto) {
    return this.venueService.createRoom(dto);
  }

  @Post('bookings')
  createRoomBooking(@Body() dto: CreateRoomBookingDto) {
    return this.venueService.createRoomBooking(dto);
  }

  @Get('rooms/available')
  findAvailableRooms(
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string,
    @Query('minCapacity') minCapacity?: string,
  ) {
    return this.venueService.findAvailableRooms(
      date,
      startTime,
      endTime,
      minCapacity ? parseInt(minCapacity) : 0,
    );
  }

  @Get('slots/:slotId/replacements/:offeringId')
  findReplacementSlots(
    @Param('slotId') slotId: string,
    @Param('offeringId') offeringId: string,
  ) {
    return this.venueService.findReplacementSlots(slotId, offeringId);
  }
}