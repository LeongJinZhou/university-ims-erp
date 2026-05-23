import { Module } from '@nestjs/common';
import { ProgrammeModule } from './programme/programme.module';
import { CourseModule } from './course/course.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [ProgrammeModule, CourseModule],
  providers: [PrismaService],
})
export class AppModule {}
