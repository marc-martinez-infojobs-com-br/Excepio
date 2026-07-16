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

// Tipo para los resultados de la query raw de agrupación por mensaje
interface GroupedExceptionRawResult {
  message: string;
  levelId: number;
  platformId: number;
  count: bigint;
  lastSeen: Date;
  firstSeen: Date;
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
   * - Rango <= 7 días: por día
   * - Rango <= 90 días: por semana
   * - Rango > 90 días: por mes
   */
  async getByTime(filters: TimeStatsFilterDto): Promise<TimeStatsResponseDto> {
    const now = new Date();

    // Calcular período
    const endDate = filters.endDate ? new Date(filters.endDate) : now;
    const startDate = filters.startDate
      ? new Date(filters.startDate)
      : new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24h antes

    // Calcular duración del período en horas y días
    const periodHours =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    const periodDays = periodHours / 24;

    // Determinar granularidad
    let granularity: 'hour' | 'day' | 'week' | 'month';
    if (filters.granularity) {
      granularity = filters.granularity;
    } else if (periodHours <= 48) {
      granularity = 'hour';
    } else if (periodDays <= 7) {
      granularity = 'day';
    } else if (periodDays <= 90) {
      granularity = 'week';
    } else {
      granularity = 'month';
    }

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

  /**
   * Obtiene la distribución de excepciones por plataforma.
   * Retorna el count y porcentaje para cada plataforma.
   */
  async getByPlatform(
    filters: StatsFilterDto,
  ): Promise<PlatformStatsResponseDto> {
    const now = new Date();

    // Calcular período
    const endDate = filters.endDate ? new Date(filters.endDate) : now;
    const startDate = filters.startDate
      ? new Date(filters.startDate)
      : new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24h antes

    // Agrupar excepciones por plataforma
    const groupedData = await this.prisma.exception.groupBy({
      by: ['platformId'],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Si no hay datos, retornar vacío
    if (groupedData.length === 0) {
      return { data: [], total: 0 };
    }

    // Obtener los IDs de las plataformas
    const platformIds = groupedData.map((g) => g.platformId);

    // Obtener nombres de plataformas
    const platforms = await this.prisma.platform.findMany({
      where: {
        id: { in: platformIds },
      },
      select: {
        id: true,
        name: true,
      },
    });

    // Crear mapa de nombres
    const platformNameMap = new Map<number, string>();
    for (const platform of platforms) {
      platformNameMap.set(platform.id, platform.name);
    }

    // Calcular total
    const total = groupedData.reduce((sum, g) => sum + g._count.id, 0);

    // Construir respuesta con porcentajes
    const data = groupedData.map((g) => ({
      platformId: g.platformId,
      platformName: platformNameMap.get(g.platformId) || 'Unknown',
      count: g._count.id,
      percent: total > 0 ? Math.round((g._count.id / total) * 100) : 0,
    }));

    return { data, total };
  }

  /**
   * Obtiene excepciones agrupadas por mensaje.
   * Útil para identificar los errores más frecuentes.
   */
  async getGroupedByMessage(
    filters: GroupedExceptionsFilterDto,
  ): Promise<GroupedExceptionsResponseDto> {
    const now = new Date();

    // Calcular período
    const endDate = filters.endDate ? new Date(filters.endDate) : now;
    const startDate = filters.startDate
      ? new Date(filters.startDate)
      : new Date(endDate.getTime() - 24 * 60 * 60 * 1000); // 24h antes

    // Paginación con valores por defecto
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const offset = (page - 1) * limit;

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

    // Query para obtener excepciones agrupadas por mensaje, level y plataforma
    const rawResults = await this.prisma.$queryRawUnsafe<GroupedExceptionRawResult[]>(`
      SELECT 
        "message",
        "levelId",
        "platformId",
        COUNT(*)::bigint as count,
        MAX("createdAt") as "lastSeen",
        MIN("createdAt") as "firstSeen"
      FROM "Exception"
      WHERE ${whereClause}
      GROUP BY "message", "levelId", "platformId"
      ORDER BY count DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `);

    // Query para contar el total de grupos distintos
    const totalCount = await this.prisma.exception.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(filters.platformId && { platformId: filters.platformId }),
        ...(filters.levelId && { levelId: filters.levelId }),
      },
    });

    // Transformar resultados
    const data = rawResults.map((row) => ({
      message: row.message,
      levelId: row.levelId,
      platformId: row.platformId,
      count: Number(row.count),
      lastSeen: row.lastSeen.toISOString(),
      firstSeen: row.firstSeen.toISOString(),
    }));

    return {
      data,
      total: totalCount,
      page,
      limit,
    };
  }
}
