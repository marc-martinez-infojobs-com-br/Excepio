import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';
import type {
  TotalStatsResponseDto,
  TimeStatsResponseDto,
  TimeDataPointDto,
  PlatformStatsResponseDto,
  GroupedExceptionsResponseDto,
} from '@excepio/shared';
import {
  StatsFilterDto,
  TimeStatsFilterDto,
  GroupedExceptionsFilterDto,
} from './dto';

// Tipo para los resultados de la query raw de agrupación temporal
interface TimeGroupRawResult {
  date: Date;
  levelId: number;
  count: bigint;
}

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

  /**
   * Obtiene excepciones agrupadas por tiempo y nivel de severidad.
   * La granularidad se calcula automáticamente según el rango:
   * - Rango <= 48h: por hora
   * - Rango > 48h: por día
   */
  async getByTime(filters: TimeStatsFilterDto): Promise<TimeStatsResponseDto> {
    const now = new Date();

    // Calcular período
    const endDate = filters.endDate ? new Date(filters.endDate) : now;
    const startDate = filters.startDate
      ? new Date(filters.startDate)
      : new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24h antes

    // Calcular duración del período en horas
    const periodHours =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

    // Determinar granularidad
    const granularity: 'hour' | 'day' =
      filters.granularity || (periodHours <= 48 ? 'hour' : 'day');

    // Construir condiciones WHERE
    const conditions: string[] = [
      `"createdAt" >= '${startDate.toISOString()}'`,
      `"createdAt" <= '${endDate.toISOString()}'`,
    ];

    if (filters.platformId) {
      conditions.push(`"platformId" = ${filters.platformId}`);
    }

    if (filters.levelId) {
      conditions.push(`"levelId" = ${filters.levelId}`);
    }

    const whereClause = conditions.join(' AND ');

    // Query raw para agrupar por fecha truncada y nivel
    // Usamos Prisma.raw para construir la query completa ya que date_trunc necesita un literal
    const rawResults = await this.prisma.$queryRawUnsafe<TimeGroupRawResult[]>(`
      SELECT 
        date_trunc('${granularity}', "createdAt") as date,
        "levelId",
        COUNT(*)::bigint as count
      FROM "Exception"
      WHERE ${whereClause}
      GROUP BY date_trunc('${granularity}', "createdAt"), "levelId"
      ORDER BY date ASC
    `);

    // Agrupar resultados por fecha
    const dataMap = new Map<string, TimeDataPointDto>();

    for (const row of rawResults) {
      const dateKey = row.date.toISOString();

      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, {
          date: dateKey,
          levels: {},
          total: 0,
        });
      }

      const point = dataMap.get(dateKey)!;
      const count = Number(row.count);
      point.levels[row.levelId.toString()] = count;
      point.total += count;
    }

    return {
      data: Array.from(dataMap.values()),
      granularity,
    };
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
