import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import type {
  ExceptionDto,
  CreateExceptionDto,
  ExceptionFilterDto,
  ExceptionListResponseDto,
  ExceptionDetailDto,
} from '@excepio/shared';
import type { ExceptionRepository } from './repository';
import { EXCEPTION_REPOSITORY } from './repository';
import type { PlatformRepository } from '../platform/repository';
import { PLATFORM_REPOSITORY } from '../platform/repository';
import type { LevelRepository } from '../level/repository';
import { LEVEL_REPOSITORY } from '../level/repository';

/**
 * Servicio para gestionar excepciones.
 */
@Injectable()
export class ExceptionService {
  constructor(
    @Inject(EXCEPTION_REPOSITORY)
    private readonly exceptionRepository: ExceptionRepository,
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
    @Inject(LEVEL_REPOSITORY)
    private readonly levelRepository: LevelRepository,
  ) {}

  /**
   * Crea una nueva excepción.
   * Valida que el levelId sea válido (1-5) y usa levelId=2 (INFO) si no es válido.
   * @param platformId - ID de la plataforma que reporta la excepción
   * @param data - Datos de la excepción
   * @returns La excepción creada
   */
  async create(
    platformId: number,
    data: CreateExceptionDto,
  ): Promise<ExceptionDto> {
    // Validar y normalizar levelId
    let levelId = data.levelId;
    if (levelId < 1 || levelId > 5) {
      levelId = 2; // INFO por defecto
    }

    const normalizedData: CreateExceptionDto = {
      ...data,
      levelId,
    };

    return this.exceptionRepository.create(platformId, normalizedData);
  }

  /**
   * Busca una excepción por su ID.
   * @param id - ID de la excepción (UUID)
   * @returns La excepción encontrada
   * @throws NotFoundException si la excepción no existe
   */
  async findById(id: string): Promise<ExceptionDto> {
    const exception = await this.exceptionRepository.findById(id);
    if (!exception) {
      throw new NotFoundException(`Exception with id ${id} not found`);
    }
    return exception;
  }

  /**
   * Normaliza los filtros eliminando strings vacíos y NaN.
   * Swagger envía campos vacíos como "" que se convierten a NaN para números.
   */
  private normalizeFilters(filters: ExceptionFilterDto): ExceptionFilterDto {
    const normalized: ExceptionFilterDto = {
      page: filters.page || 1,
      limit: filters.limit || 50,
    };

    // Solo incluir filtros que tengan valores válidos (no undefined, null, o NaN)
    if (filters.platformId !== undefined && filters.platformId !== null && !Number.isNaN(filters.platformId)) {
      normalized.platformId = filters.platformId;
    }
    if (filters.levelId !== undefined && filters.levelId !== null && !Number.isNaN(filters.levelId)) {
      normalized.levelId = filters.levelId;
    }
    if (filters.userId && filters.userId.trim() !== '') {
      normalized.userId = filters.userId;
    }
    if (filters.startDate && filters.startDate.trim() !== '') {
      normalized.startDate = filters.startDate;
    }
    if (filters.endDate && filters.endDate.trim() !== '') {
      normalized.endDate = filters.endDate;
    }
    if (filters.messageSearch && filters.messageSearch.trim() !== '') {
      normalized.messageSearch = filters.messageSearch;
    }
    if (filters.stackTraceSearch && filters.stackTraceSearch.trim() !== '') {
      normalized.stackTraceSearch = filters.stackTraceSearch;
    }
    if (filters.urlSearch && filters.urlSearch.trim() !== '') {
      normalized.urlSearch = filters.urlSearch;
    }
    if (filters.userAgentSearch && filters.userAgentSearch.trim() !== '') {
      normalized.userAgentSearch = filters.userAgentSearch;
    }
    if (filters.appVersionSearch && filters.appVersionSearch.trim() !== '') {
      normalized.appVersionSearch = filters.appVersionSearch;
    }
    if (filters.metadataSearch && filters.metadataSearch.trim() !== '') {
      normalized.metadataSearch = filters.metadataSearch;
    }

    return normalized;
  }

  /**
   * Obtiene excepciones con filtros y paginación.
   * @param filters - Filtros de búsqueda y paginación
   * @returns Lista paginada de excepciones
   */
  async findAll(
    filters: ExceptionFilterDto,
  ): Promise<ExceptionListResponseDto> {
    const normalizedFilters = this.normalizeFilters(filters);
    return this.exceptionRepository.findAll(normalizedFilters);
  }

  /**
   * Busca una excepción por su ID con información adicional.
   * Incluye el número de usuarios distintos afectados por el mismo error,
   * historial de ocurrencias y estadísticas por día.
   * @param id - ID de la excepción (UUID)
   * @returns La excepción con detalles enriquecidos
   * @throws NotFoundException si la excepción no existe
   */
  async findByIdWithDetails(id: string): Promise<ExceptionDetailDto> {
    const exception = await this.exceptionRepository.findById(id);
    if (!exception) {
      throw new NotFoundException(`Exception with id ${id} not found`);
    }

    // Obtener datos enriquecidos en paralelo
    const [
      affectedUsersCount,
      level,
      platform,
      occurrences,
      occurrencesByDay,
      totalOccurrences,
    ] = await Promise.all([
      this.exceptionRepository.countAffectedUsers(exception.message),
      this.levelRepository.findById(exception.levelId),
      this.platformRepository.findById(exception.platformId),
      this.exceptionRepository.findOccurrencesByMessage(exception.message, 10),
      this.exceptionRepository.countOccurrencesByDay(exception.message, 7),
      this.exceptionRepository.countTotalOccurrences(exception.message),
    ]);

    return {
      ...exception,
      affectedUsersCount,
      levelName: level?.name,
      platformName: platform?.name,
      platformIcon: platform?.icon,
      occurrences,
      occurrencesByDay,
      totalOccurrences,
    };
  }
}
