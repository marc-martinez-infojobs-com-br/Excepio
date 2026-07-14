import type { ProjectDto, CreateProjectDto, UpdateProjectDto } from '@excepio/shared';

/**
 * Interfaz del repositorio de Project.
 * Define el contrato para el acceso a datos de proyectos.
 */
export interface ProjectRepository {
  /**
   * Obtiene todos los proyectos (excluyendo DELETED).
   */
  findAll(): Promise<ProjectDto[]>;

  /**
   * Busca un proyecto por su ID.
   * @param id - ID del proyecto
   * @returns El proyecto encontrado o null si no existe
   */
  findById(id: number): Promise<ProjectDto | null>;

  /**
   * Verifica si existe un proyecto con el ID dado (incluyendo DELETED).
   * @param id - ID del proyecto
   * @returns true si existe, false si no
   */
  existsById(id: number): Promise<boolean>;

  /**
   * Busca un proyecto por su API Key.
   * Solo retorna proyectos ACTIVE.
   * @param apiKey - API Key del proyecto
   * @returns El proyecto encontrado o null si no existe o no está activo
   */
  findByApiKey(apiKey: string): Promise<ProjectDto | null>;

  /**
   * Crea un nuevo proyecto con API Key autogenerada.
   * @param data - Datos del proyecto (id, name). apiKey se genera internamente.
   * @returns El proyecto creado con su apiKey
   */
  create(data: CreateProjectDto): Promise<ProjectDto>;

  /**
   * Actualiza un proyecto existente.
   * Nota: apiKey NO puede actualizarse aquí, usar regenerate().
   * @param id - ID del proyecto a actualizar
   * @param data - Datos a actualizar (name, statusId)
   * @returns El proyecto actualizado o null si no existe
   */
  update(id: number, data: UpdateProjectDto): Promise<ProjectDto | null>;

  /**
   * Elimina un proyecto (borrado lógico mediante statusId = 4).
   * @param id - ID del proyecto a eliminar
   * @returns El proyecto eliminado o null si no existe
   */
  delete(id: number): Promise<ProjectDto | null>;

  /**
   * Regenera la API Key de un proyecto.
   * Genera una nueva API Key internamente.
   * @param id - ID del proyecto
   * @returns El proyecto con la nueva API Key o null si no existe
   */
  regenerate(id: number): Promise<ProjectDto | null>;
}

/**
 * Token de inyección para el repositorio de Project.
 * Usar con @Inject(PROJECT_REPOSITORY) en los servicios.
 */
export const PROJECT_REPOSITORY = 'PROJECT_REPOSITORY';
