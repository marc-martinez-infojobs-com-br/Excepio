import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type {
  PlatformDto,
  CreatePlatformDto,
  UpdatePlatformDto,
} from '@excepio/shared';
import type { PlatformRepository } from './repository';
import { PLATFORM_REPOSITORY } from './repository';

/**
 * Servicio para gestionar plataformas.
 */
@Injectable()
export class PlatformService {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
  ) {}

  /**
   * Obtiene todas las plataformas.
   * @returns Lista de plataformas
   */
  async findAll(): Promise<PlatformDto[]> {
    return this.platformRepository.findAll();
  }

  /**
   * Busca una plataforma por su ID.
   * @param id - ID de la plataforma a buscar
   * @returns La plataforma encontrada
   * @throws NotFoundException si la plataforma no existe
   */
  async findById(id: number): Promise<PlatformDto> {
    const platform = await this.platformRepository.findById(id);
    if (!platform) {
      throw new NotFoundException(`Platform with id ${id} not found`);
    }
    return platform;
  }

  /**
   * Crea una nueva plataforma.
   * @param createPlatformDto - Datos de la plataforma a crear
   * @returns La plataforma creada con apiKey generada
   * @throws ConflictException si el ID ya existe
   */
  async create(createPlatformDto: CreatePlatformDto): Promise<PlatformDto> {
    const exists = await this.platformRepository.existsById(
      createPlatformDto.id,
    );
    if (exists) {
      throw new ConflictException(
        `Platform with id ${createPlatformDto.id} already exists`,
      );
    }

    return this.platformRepository.create(createPlatformDto);
  }

  /**
   * Actualiza una plataforma existente.
   * @param id - ID de la plataforma a actualizar
   * @param updatePlatformDto - Datos a actualizar
   * @returns La plataforma actualizada
   * @throws NotFoundException si la plataforma no existe
   */
  async update(
    id: number,
    updatePlatformDto: UpdatePlatformDto,
  ): Promise<PlatformDto> {
    const platform = await this.platformRepository.update(
      id,
      updatePlatformDto,
    );
    if (!platform) {
      throw new NotFoundException(`Platform with id ${id} not found`);
    }
    return platform;
  }

  /**
   * Elimina una plataforma (borrado lógico).
   * @param id - ID de la plataforma a eliminar
   * @returns La plataforma eliminada
   * @throws NotFoundException si la plataforma no existe
   */
  async delete(id: number): Promise<PlatformDto> {
    const platform = await this.platformRepository.delete(id);
    if (!platform) {
      throw new NotFoundException(`Platform with id ${id} not found`);
    }
    return platform;
  }

  /**
   * Regenera la API Key de una plataforma.
   * @param id - ID de la plataforma
   * @returns La plataforma con la nueva API Key
   * @throws NotFoundException si la plataforma no existe
   */
  async regenerate(id: number): Promise<PlatformDto> {
    const platform = await this.platformRepository.regenerate(id);
    if (!platform) {
      throw new NotFoundException(`Platform with id ${id} not found`);
    }
    return platform;
  }

  /**
   * Activa una plataforma eliminada.
   * @param id - ID de la plataforma
   * @returns La plataforma activada
   * @throws NotFoundException si la plataforma no existe
   */
  async activate(id: number): Promise<PlatformDto> {
    const platform = await this.platformRepository.activate(id);
    if (!platform) {
      throw new NotFoundException(`Platform with id ${id} not found`);
    }
    return platform;
  }
}
