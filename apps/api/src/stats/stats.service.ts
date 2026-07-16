import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';
import type {
  TotalStatsResponseDto,
  TimeStatsResponseDto,
  PlatformStatsResponseDto,
  GroupedExceptionsResponseDto,
} from '@excepio/shared';
import {
  StatsFilterDto,
  TimeStatsFilterDto,
  GroupedExceptionsFilterDto,
} from './dto';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTotal(_filters: StatsFilterDto): TotalStatsResponseDto {
    // TODO: Implementar en Fase 1
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getByTime(_filters: TimeStatsFilterDto): TimeStatsResponseDto {
    // TODO: Implementar en Fase 2
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getByPlatform(_filters: StatsFilterDto): PlatformStatsResponseDto {
    // TODO: Implementar en Fase 3
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getGroupedByMessage(
    _filters: GroupedExceptionsFilterDto,
  ): GroupedExceptionsResponseDto {
    // TODO: Implementar en Fase 4
    throw new Error('Not implemented');
  }
}
