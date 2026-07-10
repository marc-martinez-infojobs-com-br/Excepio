import type { StatusResponseDto } from '@excepio/shared';

/**
 * Interfaz del repositorio de Status (solo lectura).
 * Define el contrato para el acceso a datos de status.
 */
export interface StatusRepository {
  /**
   * Obtiene todos los status.
   */
  findAll(): Promise<StatusResponseDto[]>;

  /**
   * Busca un status por su ID.
   * @param id - ID del status
   * @returns El status encontrado o null si no existe
   */
  findById(id: number): Promise<StatusResponseDto | null>;
}

/**
 * Token de inyección para el repositorio de Status.
 * Usar con @Inject(STATUS_REPOSITORY) en los servicios.
 */
export const STATUS_REPOSITORY = 'STATUS_REPOSITORY';
