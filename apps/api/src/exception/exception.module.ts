import { Module } from '@nestjs/common';
import { ExceptionController } from './exception.controller';
import { ExceptionService } from './exception.service';
import { ExceptionPrismaRepository, EXCEPTION_REPOSITORY } from './repository';
import { ProjectModule } from '../project/project.module';

@Module({
  imports: [ProjectModule], // Importamos ProjectModule para usar PROJECT_REPOSITORY
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
