import { IsString, IsNotEmpty, IsEnum, IsInt, Min } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsString()
  @IsNotEmpty()
  programmeId: string;

  @IsString()
  @IsNotEmpty()
  programmeVersionId: string;

  @IsEnum(['APRIL', 'JULY', 'OCTOBER'])
  intakePeriod: 'APRIL' | 'JULY' | 'OCTOBER';

  @IsInt()
  @Min(2020)
  intakeYear: number;
}