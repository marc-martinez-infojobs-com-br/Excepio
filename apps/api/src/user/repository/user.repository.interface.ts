import type { UserResponseDto, CreateUserDto, UpdateUserDto } from '@excepio/shared';

/**
 * Interfaz del repositorio de User.
 * Define el contrato para el acceso a datos de usuarios.
 */
export interface UserRepository {
  /**
   * Obtiene todos los usuarios.
   */
  findAll(): Promise<UserResponseDto[]>;

  /**
   * Busca un usuario por su ID.
   * @param id - ID del usuario
   * @returns El usuario encontrado o null si no existe
   */
  findById(id: string): Promise<UserResponseDto | null>;

  /**
   * Busca un usuario por su email.
   * @param email - Email del usuario
   * @returns El usuario encontrado o null si no existe
   */
  findByEmail(email: string): Promise<UserResponseDto | null>;

  /**
   * Crea un nuevo usuario.
   * @param data - Datos del usuario a crear
   * @returns El usuario creado
   */
  create(data: CreateUserDto & { password: string }): Promise<UserResponseDto>;

  /**
   * Actualiza un usuario existente.
   * @param id - ID del usuario a actualizar
   * @param data - Datos a actualizar
   * @returns El usuario actualizado o null si no existe
   */
  update(id: string, data: UpdateUserDto): Promise<UserResponseDto | null>;

  /**
   * Elimina un usuario (borrado lógico mediante statusId).
   * @param id - ID del usuario a eliminar
   * @returns El usuario eliminado o null si no existe
   */
  delete(id: string): Promise<UserResponseDto | null>;

  /**
   * Obtiene el password hasheado de un usuario por email.
   * Usado solo para autenticación.
   * @param email - Email del usuario
   * @returns El password hasheado o null si no existe
   */
  findPasswordByEmail(email: string): Promise<string | null>;

  /**
   * Actualiza la fecha de último login.
   * @param id - ID del usuario
   */
  updateLastLogin(id: string): Promise<void>;
}

/**
 * Token de inyección para el repositorio de User.
 * Usar con @Inject(USER_REPOSITORY) en los servicios.
 */
export const USER_REPOSITORY = 'USER_REPOSITORY';
