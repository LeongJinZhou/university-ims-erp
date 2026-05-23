import { IsString, IsNumber, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MqaPlanCourseDto {
  @IsString()
  courseId: string;

  @IsOptional()
  isElective?: boolean;
}

export class CreateMqaSemesterPlanDto {
  @IsString()
  programmeVersionId: string;

  @IsNumber()
  semesterNumber: number;

  @IsNumber()
  totalCredits: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MqaPlanCourseDto)
  courses: MqaPlanCourseDto[];
}