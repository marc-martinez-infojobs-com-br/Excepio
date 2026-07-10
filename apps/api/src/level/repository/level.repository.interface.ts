import type { LevelResponseDto } from '@excepio/shared';

/**
 * Interfaz del repositorio de Level (solo lectura).
 * Define el contrato para el acceso a datos de niveles de severidad.
 */
export interface LevelRepository {
  /**
   * Obtiene todos los niveles (incluyendo eliminados).
   */
  findAll(): Promise<LevelResponseDto[]>;

  /**
   * Obtiene solo los niveles activos (statusId != DELETED).
   */
  findAllActive(): Promise<LevelResponseDto[]>;

  /**
   * Busca un nivel por su ID.
   * @param id - ID del nivel
   * @returns El nivel encontrado o null si no existe
   */
  findById(id: number): Promise<LevelResponseDto | null>;
}

/**
 * Token de inyección para el repositorio de Level.
 * Usar con @Inject(LEVEL_REPOSITORY) en los servicios.
 */
export const LEVEL_REPOSITORY = 'LEVEL_REPOSITORY';
