import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { StatusResponseDto } from '@excepio/shared';
import type { StatusRepository } from './repository';
import { STATUS_REPOSITORY } from './repository';

/**
 * Servicio para gestionar los status (solo lectura).
 */
@Injectable()
export class StatusService {
  constructor(
    @Inject(STATUS_REPOSITORY)
    private readonly statusRepository: StatusRepository,
  ) {}

  /**
   * Obtiene todos los status.
   * @returns Lista de status
   */
  async findAll(): Promise<StatusResponseDto[]> {
    return this.statusRepository.findAll();
  }

  /**
   * Busca un status por su ID.
   * @param id - ID del status a buscar
   * @returns El status encontrado
   * @throws NotFoundException si el status no existe
   */
  async findById(id: number): Promise<StatusResponseDto> {
    const status = await this.statusRepository.findById(id);
    if (!status) {
      throw new NotFoundException(`Status with id ${id} not found`);
    }
    return status;
  }
}
