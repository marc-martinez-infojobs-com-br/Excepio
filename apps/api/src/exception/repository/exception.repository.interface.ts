import type {
  ExceptionDto,
  CreateExceptionDto,
  ExceptionFilterDto,
  ExceptionListResponseDto,
} from '@excepio/shared';

/**
 * Interfaz del repositorio de Exception.
 * Define el contrato para el acceso a datos de excepciones.
 */
export interface ExceptionRepository {
  /**
   * Crea una nueva excepción.
   * @param platformId - ID de la plataforma que reporta la excepción
   * @param data - Datos de la excepción (levelId, message, stackTrace, etc.)
   * @returns La excepción creada con su ID generado
   */
  create(platformId: number, data: CreateExceptionDto): Promise<ExceptionDto>;

  /**
   * Busca una excepción por su ID.
   * @param id - ID de la excepción (UUID)
   * @returns La excepción encontrada o null si no existe
   */
  findById(id: string): Promise<ExceptionDto | null>;

  /**
   * Obtiene excepciones con filtros y paginación.
   * @param filters - Filtros de búsqueda y paginación
   * @returns Lista paginada de excepciones
   */
  findAll(filters: ExceptionFilterDto): Promise<ExceptionListResponseDto>;

  /**
   * Cuenta el número de usuarios distintos afectados por un error específico.
   * @param message - Mensaje de la excepción (match exacto)
   * @returns Número de userId distintos (excluye null)
   */
  countAffectedUsers(message: string): Promise<number>;
}

/**
 * Token de inyección para el repositorio de Exception.
 * Usar con @Inject(EXCEPTION_REPOSITORY) en los servicios.
 */
export const EXCEPTION_REPOSITORY = 'EXCEPTION_REPOSITORY';
