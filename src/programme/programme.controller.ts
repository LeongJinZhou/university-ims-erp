import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ProgrammeService } from './programme.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { CreateProgrammeDto } from './dto/create-programme.dto';
import { CreateProgrammeVersionDto } from './dto/create-programme-version.dto';
import { CreateMqaSemesterPlanDto } from './dto/create-semester-plan.dto';

@Controller('programme')
export class ProgrammeController {
  constructor(private readonly programmeService: ProgrammeService) {}

  @Get()
  getAllProgrammes() {
    return this.programmeService.getAllProgrammes();
  }

  @Post('departments')
  createDepartment(@Body() dto: CreateDepartmentDto) {
    return this.programmeService.createDepartment(dto);
  }

  @Post('faculties')
  createFaculty(@Body() dto: CreateFacultyDto) {
    return this.programmeService.createFaculty(dto);
  }

  @Post()
  createProgramme(@Body() dto: CreateProgrammeDto) {
    return this.programmeService.createProgramme(dto);
  }

  @Post('versions')
  createVersion(@Body() dto: CreateProgrammeVersionDto) {
    return this.programmeService.createProgrammeVersion(dto);
  }

  @Post('semester-plans')
  createSemesterPlan(@Body() dto: CreateMqaSemesterPlanDto) {
    return this.programmeService.createMqaSemesterPlan(dto);
  }

  @Get('faculties')
  getAllFaculties() {
    return this.programmeService.getAllFaculties();
  }

  @Get('departments')
  getAllDepartments() {
    return this.programmeService.getAllDepartments();
  }

  @Get('faculties/:code/programmes')
  getProgrammesByFaculty(@Param('code') code: string) {
    return this.programmeService.getProgrammesByFaculty(code);
  }

  @Get(':code')
  getProgramme(@Param('code') code: string) {
    return this.programmeService.getProgrammeWithVersions(code);
  }

  @Get('versions/:id/plans')
  getVersionPlans(@Param('id') id: string) {
    return this.programmeService.getVersionWithPlans(id);
  }

  @Get('plans/semester')
  getSemesterPlan(
    @Query('semester') semester: number,
    @Query('versionId') versionId: string,
  ) {
    return this.programmeService.getSemesterPlan(semester, versionId);
  }
}