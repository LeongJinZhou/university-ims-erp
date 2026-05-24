import { Module } from '@nestjs/common';
import { ProgrammeModule } from './programme/programme.module';
import { CourseModule } from './course/course.module';
import { TimetableModule } from './timetable/timetable.module';
import { VenueModule } from './venue/venue.module';
import { StudentModule } from './student/student.module';
import { ExamModule } from './exam/exam.module';
import { EnrolmentModule } from './enrolment/enrolment.module';
import { HrModule } from './hr/hr.module';
import { FinanceModule } from './finance/finance.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [
    ProgrammeModule, CourseModule, TimetableModule, VenueModule,
    StudentModule, ExamModule, EnrolmentModule, HrModule, FinanceModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
