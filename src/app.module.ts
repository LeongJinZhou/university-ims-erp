import { Module } from '@nestjs/common';
import { ProgrammeModule } from './programme/programme.module';
import { CourseModule } from './course/course.module';
import { TimetableModule } from './timetable/timetable.module';
import { VenueModule } from './venue/venue.module';
import { StudentModule } from './student/student.module';
import { ExamModule } from './exam/exam.module';
import { EnrolmentModule } from './enrolment/enrolment.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [ProgrammeModule, CourseModule, TimetableModule, VenueModule, StudentModule, ExamModule, EnrolmentModule],
  providers: [PrismaService],
})
export class AppModule {}
