import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { CreateCourseOfferingDto } from './dto/create-course-offering.dto';
import { CreateTimetableSlotDto } from './dto/create-timetable-slot.dto';
import { SolveTimetableDto } from './dto/solve-timetable.dto';

@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Get('slots')
  getAllSlots() {
    return this.timetableService.getAllSlots();
  }

  @Post('semesters')
  createSemester(@Body() dto: CreateSemesterDto) {
    return this.timetableService.createSemester(dto);
  }

  @Post('offerings')
  createCourseOffering(@Body() dto: CreateCourseOfferingDto) {
    return this.timetableService.createCourseOffering(dto);
  }

  @Post('slots')
  createTimetableSlot(@Body() dto: CreateTimetableSlotDto) {
    return this.timetableService.createTimetableSlot(dto);
  }

  @Post('generate/:semesterId')
  generateDraftTimetable(@Param('semesterId') semesterId: string) {
    return this.timetableService.generateDraftTimetable(semesterId);
  }

  @Post(':id/approve')
  approveTimetable(
    @Param('id') id: string,
    @Body() body: { approverId: string; role?: 'PC' | 'HOP' }
  ) {
    return this.timetableService.approveTimetable(id, body.approverId, body.role);
  }

  @Post('validate-credits/:semesterId')
  validateSemesterCredits(@Param('semesterId') semesterId: string) {
    return this.timetableService.validateSemesterCreditLimits(semesterId);
  }

  @Post('solve')
  solveTimetable(@Body() dto: SolveTimetableDto) {
    return this.timetableService.solveTimetable(dto);
  }

  @Post('merge')
  mergeCourses(@Body() body: { courseAId: string; courseBId: string; semesterId: string }) {
    return this.timetableService.mergeCourses(body);
  }
}