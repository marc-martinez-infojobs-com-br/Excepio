import { Injectable } from '@nestjs/common';
import {
  ExceptionDto,
  CreateExceptionDto,
  ExceptionFilterDto,
  ExceptionListResponseDto,
} from '@excepio/shared';
import { PrismaService } from '@app/prisma/prisma.service';
import { ExceptionRepository } from './exception.repository.interface';
import { Prisma } from '@prisma/client';

/**
 * Implementación del repositorio de Exception usando Prisma.
 */
@Injectable()
export class ExceptionPrismaRepository implements ExceptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Mapea un Exception de Prisma a ExceptionDto.
   */
  private mapToDto(exception: any): ExceptionDto {
    return {
      id: exception.id,
      platformId: exception.platformId,
      levelId: exception.levelId,
      message: exception.message,
      stackTrace: exception.stackTrace,
      userId: exception.userId,
      url: exception.url,
      userAgent: exception.userAgent,
      appVersion: exception.appVersion,
      metadata: exception.metadata,
      createdAt: exception.createdAt.toISOString(),
    };
  }

  async create(
    platformId: number,
    data: CreateExceptionDto,
  ): Promise<ExceptionDto> {
    const exception = await this.prisma.exception.create({
      data: {
        platformId,
        levelId: data.levelId,
        message: data.message,
        stackTrace: data.stackTrace,
        userId: data.userId,
        url: data.url,
        userAgent: data.userAgent,
        appVersion: data.appVersion,
        metadata: data.metadata
          ? (data.metadata as Prisma.InputJsonValue)
          : undefined,
      },
    });

    return this.mapToDto(exception);
  }

  async findById(id: string): Promise<ExceptionDto | null> {
    const exception = await this.prisma.exception.findUnique({
      where: { id },
    });

    if (!exception) return null;
    return this.mapToDto(exception);
  }

  async findAll(
    filters: ExceptionFilterDto,
  ): Promise<ExceptionListResponseDto> {
    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

    // Si hay metadataSearch, usamos raw query porque Prisma no soporta ILIKE en JSON
    if (filters.metadataSearch) {
      return this.findAllWithMetadataSearch(filters, page, limit, offset);
    }

    const where: Prisma.ExceptionWhereInput = {};

    // Filtros exactos
    if (filters.platformId !== undefined) {
      where.platformId = filters.platformId;
    }
    if (filters.levelId !== undefined) {
      where.levelId = filters.levelId;
    }
    if (filters.userId !== undefined) {
      where.userId = filters.userId;
    }

    // Rango de fechas
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.createdAt.lte = new Date(filters.endDate);
      }
    }

    // Búsqueda ILIKE por campo específico
    if (filters.messageSearch) {
      where.message = { contains: filters.messageSearch, mode: 'insensitive' };
    }
    if (filters.stackTraceSearch) {
      where.stackTrace = {
        contains: filters.stackTraceSearch,
        mode: 'insensitive',
      };
    }
    if (filters.urlSearch) {
      where.url = { contains: filters.urlSearch, mode: 'insensitive' };
    }
    if (filters.userAgentSearch) {
      where.userAgent = {
        contains: filters.userAgentSearch,
        mode: 'insensitive',
      };
    }
    if (filters.appVersionSearch) {
      where.appVersion = {
        contains: filters.appVersionSearch,
        mode: 'insensitive',
      };
    }

    // Ejecutar consultas en paralelo
    const [exceptions, total] = await Promise.all([
      this.prisma.exception.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.exception.count({ where }),
    ]);

    return {
      data: exceptions.map((e) => this.mapToDto(e)),
      total,
      page,
      limit,
    };
  }

  /**
   * Búsqueda con metadataSearch usando raw SQL (PostgreSQL ILIKE en JSON::text)
   */
  private async findAllWithMetadataSearch(
    filters: ExceptionFilterDto,
    page: number,
    limit: number,
    offset: number,
  ): Promise<ExceptionListResponseDto> {
    // Construir condiciones WHERE dinámicamente
    const conditions: string[] = [
      'metadata IS NOT NULL',
      'metadata::text ILIKE $1',
    ];
    const params: (string | number | Date)[] = [`%${filters.metadataSearch}%`];
    let paramIndex = 2;

    if (filters.platformId !== undefined) {
      conditions.push(`"platformId" = $${paramIndex}`);
      params.push(filters.platformId);
      paramIndex++;
    }
    if (filters.levelId !== undefined) {
      conditions.push(`"levelId" = $${paramIndex}`);
      params.push(filters.levelId);
      paramIndex++;
    }
    if (filters.userId !== undefined) {
      conditions.push(`"userId" = $${paramIndex}`);
      params.push(filters.userId);
      paramIndex++;
    }
    if (filters.startDate) {
      conditions.push(`"createdAt" >= $${paramIndex}`);
      params.push(new Date(filters.startDate));
      paramIndex++;
    }
    if (filters.endDate) {
      conditions.push(`"createdAt" <= $${paramIndex}`);
      params.push(new Date(filters.endDate));
      paramIndex++;
    }
    if (filters.messageSearch) {
      conditions.push(`message ILIKE $${paramIndex}`);
      params.push(`%${filters.messageSearch}%`);
      paramIndex++;
    }
    if (filters.stackTraceSearch) {
      conditions.push(`"stackTrace" ILIKE $${paramIndex}`);
      params.push(`%${filters.stackTraceSearch}%`);
      paramIndex++;
    }
    if (filters.urlSearch) {
      conditions.push(`url ILIKE $${paramIndex}`);
      params.push(`%${filters.urlSearch}%`);
      paramIndex++;
    }
    if (filters.userAgentSearch) {
      conditions.push(`"userAgent" ILIKE $${paramIndex}`);
      params.push(`%${filters.userAgentSearch}%`);
      paramIndex++;
    }
    if (filters.appVersionSearch) {
      conditions.push(`"appVersion" ILIKE $${paramIndex}`);
      params.push(`%${filters.appVersionSearch}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Query para datos
    const dataQuery = `
      SELECT * FROM "Exception"
      WHERE ${whereClause}
      ORDER BY "createdAt" DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limit, offset);

    // Query para count (sin limit/offset)
    const countQuery = `
      SELECT COUNT(*)::int as count FROM "Exception"
      WHERE ${whereClause}
    `;
    const countParams = params.slice(0, -2); // Sin limit y offset

    const [exceptions, countResult] = await Promise.all([
      this.prisma.$queryRawUnsafe<any[]>(dataQuery, ...params),
      this.prisma.$queryRawUnsafe<[{ count: number }]>(
        countQuery,
        ...countParams,
      ),
    ]);

    return {
      data: exceptions.map((e) => this.mapToDto(e)),
      total: countResult[0].count,
      page,
      limit,
    };
  }

  async countAffectedUsers(message: string): Promise<number> {
    const result = await this.prisma.$queryRaw<[{ count: number }]>`
      SELECT COUNT(DISTINCT "userId")::int as count
      FROM "Exception"
      WHERE message = ${message}
        AND "userId" IS NOT NULL
    `;
    
    return result[0].count;
  }
}
