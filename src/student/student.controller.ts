import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';

@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post()
  createStudent(@Body() dto: CreateStudentDto) {
    return this.studentService.createStudent(dto);
  }

  @Get(':id')
  getStudent(@Param('id') id: string) {
    return this.studentService.getStudent(id);
  }

  @Get(':id/profile')
  getStudentProfile(@Param('id') id: string) {
    return this.studentService.getStudentProfile(id);
  }

  @Get(':id/study-plan')
  getStudyPlan(
    @Param('id') id: string,
    @Query('format') format?: 'detailed' | 'summary',
  ) {
    return this.studentService.getStudyPlanView(id, format || 'detailed');
  }

  @Get(':id/at-risk')
  getAtRiskFlags(@Param('id') id: string) {
    return this.studentService.detectAtRisk(id);
  }
}