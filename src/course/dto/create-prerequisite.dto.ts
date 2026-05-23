import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreatePrerequisiteDto {
  @IsString()
  courseId: string;

  @IsString()
  prerequisiteCourseId: string;

  @IsOptional()
  @IsBoolean()
  isMandatory?: boolean;
}