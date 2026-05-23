import { IsString, IsNumber, Min } from 'class-validator';

export class AppealBillingDto {
  @IsString()
  studentId: string;

  @IsString()
  semesterId: string;

  @IsString()
  appealId: string;

  @IsNumber()
  @Min(0)
  additionalCredits: number;
}