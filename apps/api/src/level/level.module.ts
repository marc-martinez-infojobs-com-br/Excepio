import { Module } from '@nestjs/common';
import { LevelController } from './level.controller';
import { LevelService } from './level.service';
import { LevelPrismaRepository, LEVEL_REPOSITORY } from './repository';

@Module({
  controllers: [LevelController],
  providers: [
    LevelService,
    {
      provide: LEVEL_REPOSITORY,
      useClass: LevelPrismaRepository,
    },
  ],
  exports: [LevelService],
})
export class LevelModule {}
