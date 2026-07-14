import { Injectable } from '@nestjs/common';
import { ExceptionDto, CreateExceptionDto, ExceptionFilterDto, ExceptionListResponseDto } from '@excepio/shared';
import { PrismaService } from '../../prisma/prisma.service';
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
      projectId: exception.projectId,
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

  async create(projectId: number, data: CreateExceptionDto): Promise<ExceptionDto> {
    const exception = await this.prisma.exception.create({
      data: {
        projectId,
        levelId: data.levelId,
        message: data.message,
        stackTrace: data.stackTrace,
        userId: data.userId,
        url: data.url,
        userAgent: data.userAgent,
        appVersion: data.appVersion,
        metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : undefined,
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

  async findAll(filters: ExceptionFilterDto): Promise<ExceptionListResponseDto> {
    const where: Prisma.ExceptionWhereInput = {};

    // Filtros exactos
    if (filters.projectId !== undefined) {
      where.projectId = filters.projectId;
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
    if (filters.urlSearch) {
      where.url = { contains: filters.urlSearch, mode: 'insensitive' };
    }
    if (filters.userAgentSearch) {
      where.userAgent = { contains: filters.userAgentSearch, mode: 'insensitive' };
    }
    if (filters.appVersionSearch) {
      where.appVersion = { contains: filters.appVersionSearch, mode: 'insensitive' };
    }
    if (filters.metadataSearch) {
      // Para búsqueda en JSON usamos string_contains en path vacío
      where.metadata = {
        path: [],
        string_contains: filters.metadataSearch,
      };
    }

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

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
}
