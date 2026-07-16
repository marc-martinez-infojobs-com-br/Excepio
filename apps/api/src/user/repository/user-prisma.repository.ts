import { Injectable } from '@nestjs/common';
import { UserResponseDto, CreateUserDto, UpdateUserDto } from '@excepio/shared';
import { PrismaService } from '@app/prisma/prisma.service';
import { UserRepository } from './user.repository.interface';

/**
 * Implementación del repositorio de User usando Prisma.
 */
@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return users.map((user) => this.mapToDto(user));
  }

  async findById(id: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.mapToDto(user) : null;
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? this.mapToDto(user) : null;
  }

  async create(data: CreateUserDto & { password: string }): Promise<UserResponseDto> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role || 'USUARIO',
        statusId: 2, // ACTIVE por defecto
      },
    });

    return this.mapToDto(user);
  }

  async update(id: string, data: UpdateUserDto): Promise<UserResponseDto | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data,
      });

      return this.mapToDto(user);
    } catch (error) {
      return null;
    }
  }

  async delete(id: string): Promise<UserResponseDto | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          statusId: 4, // DELETED
        },
      });

      return this.mapToDto(user);
    } catch (error) {
      return null;
    }
  }

  async activate(id: string): Promise<UserResponseDto | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: {
          statusId: 2, // ACTIVE
        },
      });

      return this.mapToDto(user);
    } catch (error) {
      return null;
    }
  }

  async findPasswordByEmail(email: string): Promise<string | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { password: true },
    });

    return user?.password || null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  /**
   * Mapea un User de Prisma a UserResponseDto (sin password).
   */
  private mapToDto(user: any): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      statusId: user.statusId,
      lastLoginAt: user.lastLoginAt?.toISOString() || null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
