import { Module } from '@nestjs/common';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';
import { StatusPrismaRepository, STATUS_REPOSITORY } from './repository';

@Module({
  controllers: [StatusController],
  providers: [
    StatusService,
    {
      provide: STATUS_REPOSITORY,
      useClass: StatusPrismaRepository,
    },
  ],
  exports: [StatusService],
})
export class StatusModule {}
