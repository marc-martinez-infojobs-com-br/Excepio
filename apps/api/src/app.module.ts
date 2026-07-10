import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma';
import { LevelModule } from './level';
import { StatusModule } from './status';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: '.env',
    }),
    PrismaModule,
    LevelModule,
    StatusModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
