import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDropRequestDto {
  @IsString() @IsNotEmpty() studentId: string;
  @IsString() @IsNotEmpty() enrolmentId: string;
  @IsString() @IsNotEmpty() reason: string;
}