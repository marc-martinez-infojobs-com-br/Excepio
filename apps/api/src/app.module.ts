import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { PrismaModule } from './prisma';
import { LevelModule } from './level';
import { StatusModule } from './status';
import { UserModule } from './user';
import { AuthModule } from './auth';
import { PlatformModule } from './platform';
import { ExceptionModule } from './exception';
import { StatsModule } from './stats';
import { validate } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    LevelModule,
    StatusModule,
    PlatformModule,
    ExceptionModule,
    StatsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
