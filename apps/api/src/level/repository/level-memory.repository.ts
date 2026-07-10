import { Injectable } from '@nestjs/common';
import { LevelResponseDto, STATUS_ID } from '@excepio/shared';
import { LevelRepository } from './level.repository.interface';

/**
 * Implementación In-Memory del repositorio de Level (solo lectura).
 * Útil para tests unitarios y desarrollo sin base de datos.
 */
@Injectable()
export class LevelMemoryRepository implements LevelRepository {
  private levels: Map<number, LevelResponseDto> = new Map();

  /**
   * Inicializa el repositorio con datos opcionales.
   * @param initialData - Datos iniciales para el repositorio
   */
  constructor(initialData?: LevelResponseDto[]) {
    if (initialData) {
      initialData.forEach((level) => this.levels.set(level.id, { ...level }));
    }
  }

  /**
   * Limpia todos los datos del repositorio.
   * Útil para resetear entre tests.
   */
  clear(): void {
    this.levels.clear();
  }

  /**
   * Permite cargar datos de prueba.
   * @param data - Datos a cargar
   */
  seed(data: LevelResponseDto[]): void {
    this.clear();
    data.forEach((level) => this.levels.set(level.id, { ...level }));
  }

  async findAll(): Promise<LevelResponseDto[]> {
    return Array.from(this.levels.values()).map((level) => ({ ...level }));
  }

  async findAllActive(): Promise<LevelResponseDto[]> {
    return Array.from(this.levels.values())
      .filter((level) => level.statusId !== STATUS_ID.DELETED)
      .map((level) => ({ ...level }));
  }

  async findById(id: number): Promise<LevelResponseDto | null> {
    const level = this.levels.get(id);
    return level ? { ...level } : null;
  }
}
