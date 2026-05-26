import { Controller, Post, Get, Param, Body, Patch } from '@nestjs/common';
import { EnrolmentService } from './enrolment.service';
import { EnrolCourseDto } from './dto/enrol-course.dto';
import { CreateDropRequestDto } from './dto/create-drop-request.dto';

@Controller('enrolment')
export class EnrolmentController {
  constructor(private service: EnrolmentService) {}

  @Get('enrolments')
  getAllEnrolments() {
    return this.service.getAllEnrolments();
  }

  @Post('enrol')
  enrolCourse(@Body() dto: EnrolCourseDto) {
    return this.service.enrolCourse(dto);
  }

  @Get('student/:studentId')
  getStudentEnrolments(@Param('studentId') studentId: string) {
    return this.service.getStudentEnrolments(studentId);
  }

  @Get('eligibility/:studentId/:semesterId')
  checkCreditEligibility(@Param('studentId') studentId: string, @Param('semesterId') semesterId: string) {
    return this.service.checkCreditEligibility(studentId, semesterId);
  }

  @Post('drop/preview/:enrolmentId')
  async getDropPreview(@Param('enrolmentId') enrolmentId: string, @Body('studentId') studentId: string) {
    return this.service.generateDropImpactPreview(studentId, enrolmentId);
  }

  @Post('drop/request')
  createDropRequest(@Body() dto: CreateDropRequestDto) {
    return this.service.createDropRequest(dto);
  }

  @Patch('drop/:id/:action')
  processDropRequest(@Param('id') id: string, @Param('action') action: 'APPROVE' | 'REJECT') {
    return this.service.processDropRequest(id, action);
  }
}