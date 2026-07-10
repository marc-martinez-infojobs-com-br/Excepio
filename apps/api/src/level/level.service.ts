import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { LevelResponseDto } from '@excepio/shared';
import type { LevelRepository } from './repository';
import { LEVEL_REPOSITORY } from './repository';

/**
 * Servicio para gestionar los niveles de severidad (solo lectura).
 */
@Injectable()
export class LevelService {
  constructor(
    @Inject(LEVEL_REPOSITORY)
    private readonly levelRepository: LevelRepository,
  ) {}

  /**
   * Obtiene todos los niveles activos (no eliminados).
   * @returns Lista de niveles activos
   */
  async findAll(): Promise<LevelResponseDto[]> {
    return this.levelRepository.findAllActive();
  }

  /**
   * Busca un nivel por su ID.
   * @param id - ID del nivel a buscar
   * @returns El nivel encontrado
   * @throws NotFoundException si el nivel no existe
   */
  async findById(id: number): Promise<LevelResponseDto> {
    const level = await this.levelRepository.findById(id);
    if (!level) {
      throw new NotFoundException(`Level with id ${id} not found`);
    }
    return level;
  }
}
