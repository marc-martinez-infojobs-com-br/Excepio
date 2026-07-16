import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import type { UserResponseDto, CreateUserDto, UpdateUserDto } from '@excepio/shared';
import type { UserRepository } from './repository';
import { USER_REPOSITORY } from './repository';
import * as bcrypt from 'bcrypt';

/**
 * Servicio para gestionar usuarios.
 */
@Injectable()
export class UserService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Obtiene todos los usuarios.
   * @returns Lista de usuarios
   */
  async findAll(): Promise<UserResponseDto[]> {
    return this.userRepository.findAll();
  }

  /**
   * Busca un usuario por su ID.
   * @param id - ID del usuario a buscar
   * @returns El usuario encontrado
   * @throws NotFoundException si el usuario no existe
   */
  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  /**
   * Busca un usuario por su email.
   * @param email - Email del usuario a buscar
   * @returns El usuario encontrado
   * @throws NotFoundException si el usuario no existe
   */
  async findByEmail(email: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  /**
   * Crea un nuevo usuario.
   * @param createUserDto - Datos del usuario a crear
   * @returns El usuario creado
   * @throws ConflictException si el email ya existe
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Verificar que el email no exista
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Crear el usuario
    const user = await this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return user;
  }

  /**
   * Actualiza un usuario existente.
   * @param id - ID del usuario a actualizar
   * @param updateUserDto - Datos a actualizar
   * @returns El usuario actualizado
   * @throws NotFoundException si el usuario no existe
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.userRepository.update(id, updateUserDto);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  /**
   * Elimina un usuario (borrado lógico).
   * @param id - ID del usuario a eliminar
   * @returns El usuario eliminado
   * @throws NotFoundException si el usuario no existe
   */
  async delete(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.delete(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  /**
   * Activa un usuario (cambia su estado a ACTIVE).
   * @param id - ID del usuario a activar
   * @returns El usuario activado
   * @throws NotFoundException si el usuario no existe
   */
  async activate(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.activate(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }
}
