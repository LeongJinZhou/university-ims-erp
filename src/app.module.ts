import { Module } from '@nestjs/common';
import { ProgrammeModule } from './programme/programme.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [ProgrammeModule],
  providers: [PrismaService],
})
export class AppModule {}
