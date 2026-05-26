import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ExamService } from './exam.service';
import { CreateRetakePlanDto } from './dto/create-retake-plan.dto';

@Controller('exam')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get('retake-plans')
  getAllRetakePlans() {
    return this.examService.getAllRetakePlans();
  }

  @Post('retake-plans')
  createRetakePlan(@Body() dto: CreateRetakePlanDto) {
    return this.examService.createRetakePlan(dto);
  }

  @Get('retake-plans/:id')
  getRetakePlan(@Param('id') id: string) {
    return this.examService.getRetakePlan(id);
  }

  @Get('students/:studentId/retake-plans')
  getStudentRetakePlans(@Param('studentId') studentId: string) {
    return this.examService.getStudentRetakePlans(studentId);
  }

  @Post('results')
  recordExamResult(
    @Body() body: { studentId: string; courseOfferingId: string; grade: string; marks?: number; releasedBy?: string },
  ) {
    return this.examService.recordExamResult(body.studentId, body.courseOfferingId, body.grade, body.marks, body.releasedBy);
  }

  @Get('students/:studentId/graduation-completeness')
  getGraduationCompleteness(@Param('studentId') studentId: string) {
    return this.examService.getGraduationCompleteness(studentId);
  }
}