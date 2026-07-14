import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectPrismaRepository, PROJECT_REPOSITORY } from './repository';

@Module({
  controllers: [ProjectController],
  providers: [
    ProjectService,
    {
      provide: PROJECT_REPOSITORY,
      useClass: ProjectPrismaRepository,
    },
  ],
  exports: [ProjectService, PROJECT_REPOSITORY],
})
export class ProjectModule {}
