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

  /**
   * Obtiene el total de excepciones con comparación al período anterior.
   * Si no se especifican fechas, usa las últimas 24 horas.
   */
  async getTotal(filters: StatsFilterDto): Promise<TotalStatsResponseDto> {
    const now = new Date();

    // Calcular período actual
    const currentEnd = filters.endDate ? new Date(filters.endDate) : now;
    const currentStart = filters.startDate
      ? new Date(filters.startDate)
      : new Date(currentEnd.getTime() - 24 * 60 * 60 * 1000); // 24h antes

    // Calcular duración del período
    const periodDuration = currentEnd.getTime() - currentStart.getTime();

    // Calcular período anterior (mismo tamaño, justo antes del actual)
    const previousEnd = new Date(currentStart.getTime());
    const previousStart = new Date(previousEnd.getTime() - periodDuration);

    // Construir condición base de filtro
    const baseWhere = filters.platformId
      ? { platformId: filters.platformId }
      : {};

    // Contar excepciones del período actual
    const currentTotal = await this.prisma.exception.count({
      where: {
        ...baseWhere,
        createdAt: {
          gte: currentStart,
          lte: currentEnd,
        },
      },
    });

    // Contar excepciones del período anterior
    const previousTotal = await this.prisma.exception.count({
      where: {
        ...baseWhere,
        createdAt: {
          gte: previousStart,
          lte: previousEnd,
        },
      },
    });

    // Calcular porcentaje de cambio
    let changePercent = 0;
    if (previousTotal > 0) {
      changePercent = Math.round(
        ((currentTotal - previousTotal) / previousTotal) * 100,
      );
    }

    return {
      current: {
        total: currentTotal,
        startDate: currentStart.toISOString(),
        endDate: currentEnd.toISOString(),
      },
      previous: {
        total: previousTotal,
        startDate: previousStart.toISOString(),
        endDate: previousEnd.toISOString(),
      },
      changePercent,
    };
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
