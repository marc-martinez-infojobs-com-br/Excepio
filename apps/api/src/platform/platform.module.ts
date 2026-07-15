import { Module } from '@nestjs/common';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';
import { PlatformPrismaRepository, PLATFORM_REPOSITORY } from './repository';

@Module({
  controllers: [PlatformController],
  providers: [
    PlatformService,
    {
      provide: PLATFORM_REPOSITORY,
      useClass: PlatformPrismaRepository,
    },
  ],
  exports: [PlatformService, PLATFORM_REPOSITORY],
})
export class PlatformModule {}
