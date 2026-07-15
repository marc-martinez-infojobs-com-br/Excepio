import type { PlatformDto, CreatePlatformDto, UpdatePlatformDto } from '@excepio/shared';

/**
 * Interfaz del repositorio de Platform.
 * Define el contrato para el acceso a datos de plataformas.
 */
export interface PlatformRepository {
  /**
   * Obtiene todas las plataformas (excluyendo DELETED).
   */
  findAll(): Promise<PlatformDto[]>;

  /**
   * Busca una plataforma por su ID.
   * @param id - ID de la plataforma
   * @returns La plataforma encontrada o null si no existe
   */
  findById(id: number): Promise<PlatformDto | null>;

  /**
   * Verifica si existe una plataforma con el ID dado (incluyendo DELETED).
   * @param id - ID de la plataforma
   * @returns true si existe, false si no
   */
  existsById(id: number): Promise<boolean>;

  /**
   * Busca una plataforma por su API Key.
   * Solo retorna plataformas ACTIVE.
   * @param apiKey - API Key de la plataforma
   * @returns La plataforma encontrada o null si no existe o no está activa
   */
  findByApiKey(apiKey: string): Promise<PlatformDto | null>;

  /**
   * Crea una nueva plataforma con API Key autogenerada.
   * @param data - Datos de la plataforma (id, name). apiKey se genera internamente.
   * @returns La plataforma creada con su apiKey
   */
  create(data: CreatePlatformDto): Promise<PlatformDto>;

  /**
   * Actualiza una plataforma existente.
   * Nota: apiKey NO puede actualizarse aquí, usar regenerate().
   * @param id - ID de la plataforma a actualizar
   * @param data - Datos a actualizar (name, statusId)
   * @returns La plataforma actualizada o null si no existe
   */
  update(id: number, data: UpdatePlatformDto): Promise<PlatformDto | null>;

  /**
   * Elimina una plataforma (borrado lógico mediante statusId = 4).
   * @param id - ID de la plataforma a eliminar
   * @returns La plataforma eliminada o null si no existe
   */
  delete(id: number): Promise<PlatformDto | null>;

  /**
   * Regenera la API Key de una plataforma.
   * Genera una nueva API Key internamente.
   * @param id - ID de la plataforma
   * @returns La plataforma con la nueva API Key o null si no existe
   */
  regenerate(id: number): Promise<PlatformDto | null>;
}

/**
 * Token de inyección para el repositorio de Platform.
 * Usar con @Inject(PLATFORM_REPOSITORY) en los servicios.
 */
export const PLATFORM_REPOSITORY = 'PLATFORM_REPOSITORY';
