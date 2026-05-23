import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { HrService } from './hr.service';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { SetAvailabilityDto } from './dto/set-availability.dto';

@Controller('hr')
export class HrController {
  constructor(private service: HrService) {}

  @Post('lecturers')
  createLecturer(@Body() dto: CreateLecturerDto) {
    return this.service.createLecturer(dto);
  }

  @Get('lecturers')
  getAllLecturers() {
    return this.service.getAllLecturers();
  }

  @Get('lecturers/:id')
  getLecturer(@Param('id') id: string) {
    return this.service.getLecturer(id);
  }

  @Post('availability')
  setAvailability(@Body() dto: SetAvailabilityDto) {
    return this.service.setAvailability(dto);
  }

  @Get('teaching-loads/:semesterId')
  getTeachingLoads(@Param('semesterId') semesterId: string) {
    return this.service.getTeachingLoads(semesterId);
  }

  @Get('timetable-data/:semesterId')
  getTimetableData(@Param('semesterId') semesterId: string) {
    return this.service.getTimetableData(semesterId);
  }

  @Get('availability/:lecturerId/:semesterId')
  getLecturerAvailability(@Param('lecturerId') lecturerId: string, @Param('semesterId') semesterId: string) {
    return this.service.getLecturerAvailability(lecturerId, semesterId);
  }
}