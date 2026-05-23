import { IsString, IsOptional } from 'class-validator';

export class CreateFacultyDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  deanId?: string;
}