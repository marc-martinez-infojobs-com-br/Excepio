import { Injectable } from '@nestjs/common';
import {
  UserResponseDto,
  CreateUserDto,
  UpdateUserDto,
  UserRole,
} from '@excepio/shared';
import { UserRepository } from './user.repository.interface';

/**
 * Implementación In-Memory del repositorio de User.
 * Útil para tests unitarios y desarrollo sin base de datos.
 */
@Injectable()
export class UserMemoryRepository implements UserRepository {
  private users: Map<string, UserResponseDto & { password: string }> =
    new Map();

  /**
   * Limpia todos los datos del repositorio.
   * Útil para resetear entre tests.
   */
  clear(): void {
    this.users.clear();
  }

  /**
   * Permite cargar datos de prueba.
   * @param data - Datos a cargar
   */
  seed(data: (UserResponseDto & { password: string })[]): void {
    this.clear();
    data.forEach((user) => this.users.set(user.id, { ...user }));
  }

  async findAll(): Promise<UserResponseDto[]> {
    return Array.from(this.users.values())
      .map(({ password, ...user }) => ({ ...user }))
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }

  async findById(id: string): Promise<UserResponseDto | null> {
    const user = this.users.get(id);
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword };
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = Array.from(this.users.values()).find((u) => u.email === email);
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword };
  }

  async create(
    data: CreateUserDto & { password: string },
  ): Promise<UserResponseDto> {
    const now = new Date().toISOString();
    const user: UserResponseDto & { password: string } = {
      id: crypto.randomUUID(),
      email: data.email,
      password: data.password,
      name: data.name,
      role: data.role || UserRole.USUARIO,
      statusId: 2, // ACTIVE por defecto
      lastLoginAt: null,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(user.id, user);

    const { password, ...userWithoutPassword } = user;
    return { ...userWithoutPassword };
  }

  async update(
    id: string,
    data: UpdateUserDto,
  ): Promise<UserResponseDto | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, updatedUser);

    const { password, ...userWithoutPassword } = updatedUser;
    return { ...userWithoutPassword };
  }

  async delete(id: string): Promise<UserResponseDto | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const deletedUser = {
      ...user,
      statusId: 4, // DELETED
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, deletedUser);

    const { password, ...userWithoutPassword } = deletedUser;
    return { ...userWithoutPassword };
  }

  async activate(id: string): Promise<UserResponseDto | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const activatedUser = {
      ...user,
      statusId: 2, // ACTIVE
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, activatedUser);

    const { password, ...userWithoutPassword } = activatedUser;
    return { ...userWithoutPassword };
  }

  async findPasswordByEmail(email: string): Promise<string | null> {
    const user = Array.from(this.users.values()).find((u) => u.email === email);
    return user ? user.password : null;
  }

  async updateLastLogin(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLoginAt = new Date().toISOString();
      this.users.set(id, user);
    }
  }

  async updatePassword(
    id: string,
    hashedPassword: string,
  ): Promise<UserResponseDto | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = {
      ...user,
      password: hashedPassword,
      updatedAt: new Date().toISOString(),
    };

    this.users.set(id, updatedUser);

    const { password, ...userWithoutPassword } = updatedUser;
    return { ...userWithoutPassword };
  }
}
