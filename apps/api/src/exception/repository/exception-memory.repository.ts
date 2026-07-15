import { Injectable } from '@nestjs/common';
import { ExceptionDto, CreateExceptionDto, ExceptionFilterDto, ExceptionListResponseDto } from '@excepio/shared';
import { ExceptionRepository } from './exception.repository.interface';
import { randomUUID } from 'crypto';

/**
 * Implementación In-Memory del repositorio de Exception.
 * Útil para tests unitarios y desarrollo sin base de datos.
 */
@Injectable()
export class ExceptionMemoryRepository implements ExceptionRepository {
  private exceptions: Map<string, ExceptionDto> = new Map();

  /**
   * Limpia todos los datos del repositorio.
   * Útil para resetear entre tests.
   */
  clear(): void {
    this.exceptions.clear();
  }

  /**
   * Permite cargar datos de prueba.
   * @param data - Datos a cargar
   */
  seed(data: ExceptionDto[]): void {
    this.clear();
    data.forEach((exception) => this.exceptions.set(exception.id, { ...exception }));
  }

  async create(platformId: number, data: CreateExceptionDto): Promise<ExceptionDto> {
    const exception: ExceptionDto = {
      id: randomUUID(),
      platformId,
      levelId: data.levelId,
      message: data.message,
      stackTrace: data.stackTrace || null,
      userId: data.userId || null,
      url: data.url || null,
      userAgent: data.userAgent || null,
      appVersion: data.appVersion || null,
      metadata: data.metadata || null,
      createdAt: new Date().toISOString(),
    };
    this.exceptions.set(exception.id, exception);
    return { ...exception };
  }

  async findById(id: string): Promise<ExceptionDto | null> {
    const exception = this.exceptions.get(id);
    if (!exception) return null;
    return { ...exception };
  }

  async findAll(filters: ExceptionFilterDto): Promise<ExceptionListResponseDto> {
    let exceptions = Array.from(this.exceptions.values());

    // Filtros exactos
    if (filters.platformId !== undefined) {
      exceptions = exceptions.filter((e) => e.platformId === filters.platformId);
    }
    if (filters.levelId !== undefined) {
      exceptions = exceptions.filter((e) => e.levelId === filters.levelId);
    }
    if (filters.userId !== undefined) {
      exceptions = exceptions.filter((e) => e.userId === filters.userId);
    }

    // Rango de fechas
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      exceptions = exceptions.filter((e) => new Date(e.createdAt) >= startDate);
    }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      exceptions = exceptions.filter((e) => new Date(e.createdAt) <= endDate);
    }

    // Búsqueda ILIKE (case-insensitive)
    if (filters.messageSearch) {
      const search = filters.messageSearch.toLowerCase();
      exceptions = exceptions.filter((e) => e.message.toLowerCase().includes(search));
    }
    if (filters.stackTraceSearch && filters.stackTraceSearch.trim() !== '') {
      const search = filters.stackTraceSearch.toLowerCase();
      exceptions = exceptions.filter((e) => e.stackTrace?.toLowerCase().includes(search));
    }
    if (filters.urlSearch && filters.urlSearch.trim() !== '') {
      const search = filters.urlSearch.toLowerCase();
      exceptions = exceptions.filter((e) => e.url?.toLowerCase().includes(search));
    }
    if (filters.userAgentSearch && filters.userAgentSearch.trim() !== '') {
      const search = filters.userAgentSearch.toLowerCase();
      exceptions = exceptions.filter((e) => e.userAgent?.toLowerCase().includes(search));
    }
    if (filters.appVersionSearch && filters.appVersionSearch.trim() !== '') {
      const search = filters.appVersionSearch.toLowerCase();
      exceptions = exceptions.filter((e) => e.appVersion?.toLowerCase().includes(search));
    }
    if (filters.metadataSearch && filters.metadataSearch.trim() !== '') {
      const search = filters.metadataSearch.toLowerCase();
      exceptions = exceptions.filter((e) => {
        if (!e.metadata) return false;
        return JSON.stringify(e.metadata).toLowerCase().includes(search);
      });
    }

    // Ordenar por createdAt DESC
    exceptions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Paginación
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const total = exceptions.length;
    const offset = (page - 1) * limit;
    const paginatedExceptions = exceptions.slice(offset, offset + limit);

    return {
      data: paginatedExceptions,
      total,
      page,
      limit,
    };
  }
}
