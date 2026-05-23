import { Module } from '@nestjs/common';
import { ProgrammeController } from './programme.controller';
import { ProgrammeService } from './programme.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [ProgrammeController],
  providers: [ProgrammeService, PrismaService],
  exports: [ProgrammeService],
})
export class ProgrammeModule {}