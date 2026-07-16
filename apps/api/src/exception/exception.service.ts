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
} from '@excepio/shared';
import type { ExceptionRepository } from './repository';
import { EXCEPTION_REPOSITORY } from './repository';
import type { PlatformRepository } from '../platform/repository';
import { PLATFORM_REPOSITORY } from '../platform/repository';

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
   * Obtiene excepciones con filtros y paginación.
   * @param filters - Filtros de búsqueda y paginación
   * @returns Lista paginada de excepciones
   */
  async findAll(
    filters: ExceptionFilterDto,
  ): Promise<ExceptionListResponseDto> {
    // Normalizar paginación con defaults
    const normalizedFilters: ExceptionFilterDto = {
      ...filters,
      page: filters.page || 1,
      limit: filters.limit || 50,
    };

    return this.exceptionRepository.findAll(normalizedFilters);
  }
}
