import { Injectable } from '@nestjs/common';
import { StatusResponseDto } from '@excepio/shared';
import { StatusRepository } from './status.repository.interface';

/**
 * Implementación In-Memory del repositorio de Status (solo lectura).
 * Útil para tests unitarios y desarrollo sin base de datos.
 */
@Injectable()
export class StatusMemoryRepository implements StatusRepository {
  private statuses: Map<number, StatusResponseDto> = new Map();

  /**
   * Inicializa el repositorio con datos opcionales.
   * @param initialData - Datos iniciales para el repositorio
   */
  constructor(initialData?: StatusResponseDto[]) {
    if (initialData) {
      initialData.forEach((status) => this.statuses.set(status.id, { ...status }));
    }
  }

  /**
   * Limpia todos los datos del repositorio.
   * Útil para resetear entre tests.
   */
  clear(): void {
    this.statuses.clear();
  }

  /**
   * Permite cargar datos de prueba.
   * @param data - Datos a cargar
   */
  seed(data: StatusResponseDto[]): void {
    this.clear();
    data.forEach((status) => this.statuses.set(status.id, { ...status }));
  }

  async findAll(): Promise<StatusResponseDto[]> {
    return Array.from(this.statuses.values()).map((status) => ({ ...status }));
  }

  async findById(id: number): Promise<StatusResponseDto | null> {
    const status = this.statuses.get(id);
    return status ? { ...status } : null;
  }
}
