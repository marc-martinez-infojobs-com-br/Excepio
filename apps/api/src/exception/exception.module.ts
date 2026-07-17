import { Module } from '@nestjs/common';
import { ExceptionController } from './exception.controller';
import { ExceptionService } from './exception.service';
import { ExceptionPrismaRepository, EXCEPTION_REPOSITORY } from './repository';
import { PlatformModule } from '../platform/platform.module';
import { LevelModule } from '../level/level.module';

@Module({
  imports: [PlatformModule, LevelModule],
  controllers: [ExceptionController],
  providers: [
    ExceptionService,
    {
      provide: EXCEPTION_REPOSITORY,
      useClass: ExceptionPrismaRepository,
    },
  ],
  exports: [ExceptionService, EXCEPTION_REPOSITORY],
})
export class ExceptionModule {}
