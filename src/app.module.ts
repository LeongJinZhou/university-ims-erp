import { Module } from '@nestjs/common';
import { ProgrammeModule } from './programme/programme.module';
import { CourseModule } from './course/course.module';
import { TimetableModule } from './timetable/timetable.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [ProgrammeModule, CourseModule, TimetableModule],
  providers: [PrismaService],
})
export class AppModule {}
