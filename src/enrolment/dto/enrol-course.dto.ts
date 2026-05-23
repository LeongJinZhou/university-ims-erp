import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class EnrolCourseDto {
  @IsString() @IsNotEmpty() studentId: string;
  @IsString() @IsNotEmpty() courseOfferingId: string;
  @IsString() @IsOptional() sectionCode?: string;
}