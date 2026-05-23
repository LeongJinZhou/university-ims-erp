import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreatePrerequisiteDto } from './dto/create-prerequisite.dto';
import { CreateEquivalencyDto } from './dto/create-equivalency.dto';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  createCourse(@Body() dto: CreateCourseDto) {
    return this.courseService.createCourse(dto);
  }

  @Get(':id')
  getCourse(@Param('id') id: string) {
    return this.courseService.getCourse(id);
  }

  @Get('programme/:programmeId')
  getCoursesByProgramme(@Param('programmeId') programmeId: string) {
    return this.courseService.getCoursesByProgramme(programmeId);
  }

  @Post('prerequisites')
  createPrerequisite(@Body() dto: CreatePrerequisiteDto) {
    return this.courseService.createPrerequisite(dto);
  }

  @Delete('prerequisites/:courseId/:prerequisiteCourseId')
  removePrerequisite(
    @Param('courseId') courseId: string,
    @Param('prerequisiteCourseId') prerequisiteCourseId: string,
  ) {
    return this.courseService.removePrerequisite(courseId, prerequisiteCourseId);
  }

  @Post('equivalencies')
  createEquivalency(@Body() dto: CreateEquivalencyDto) {
    return this.courseService.createEquivalency(dto);
  }

  @Delete('equivalencies/:courseAId/:courseBId')
  removeEquivalency(@Param('courseAId') courseAId: string, @Param('courseBId') courseBId: string) {
    return this.courseService.removeEquivalency(courseAId, courseBId);
  }

  @Get(':id/equivalencies')
  getEquivalencies(@Param('id') id: string) {
    return this.courseService.getEquivalencies(id);
  }

  @Post(':id/verify-prerequisites')
  verifyPrerequisites(
    @Param('id') id: string,
    @Body() body: { completedCourseIds: string[] },
  ) {
    return this.courseService.verifyPrerequisites(id, body.completedCourseIds);
  }

  @Get(':id/prerequisite-graph')
  getPrerequisiteGraph(@Param('id') id: string) {
    return this.courseService.getPrerequisiteGraph(id);
  }

  @Get('merge-eligibility')
  checkMergeEligibility(@Query('courseAId') courseAId: string, @Query('courseBId') courseBId: string) {
    return this.courseService.checkCourseMergeEligibility(courseAId, courseBId);
  }
}