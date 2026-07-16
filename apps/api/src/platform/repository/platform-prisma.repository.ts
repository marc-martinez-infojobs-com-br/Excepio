import { Injectable } from '@nestjs/common';
import { PlatformDto, CreatePlatformDto, UpdatePlatformDto } from '@excepio/shared';
import { PrismaService } from '@app/prisma/prisma.service';
import { PlatformRepository } from './platform.repository.interface';
import { randomBytes } from 'crypto';

/**
 * Implementación del repositorio de Platform usando Prisma.
 */
@Injectable()
export class PlatformPrismaRepository implements PlatformRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera una API Key segura.
   */
  private generateApiKey(): string {
    return `exc_${randomBytes(32).toString('hex')}`;
  }

  /**
   * Mapea un Platform de Prisma a PlatformDto.
   */
  private mapToDto(platform: any): PlatformDto {
    return {
      id: platform.id,
      name: platform.name,
      icon: platform.icon,
      apiKey: platform.apiKey,
      statusId: platform.statusId,
      createdAt: platform.createdAt.toISOString(),
    };
  }

  async findAll(): Promise<PlatformDto[]> {
    const platforms = await this.prisma.platform.findMany({
      orderBy: { id: 'asc' },
    });

    return platforms.map((platform) => this.mapToDto(platform));
  }

  async findById(id: number): Promise<PlatformDto | null> {
    const platform = await this.prisma.platform.findUnique({
      where: { id },
    });

    if (!platform || platform.statusId === 4) return null;
    return this.mapToDto(platform);
  }

  async existsById(id: number): Promise<boolean> {
    const platform = await this.prisma.platform.findUnique({
      where: { id },
      select: { id: true },
    });

    return platform !== null;
  }

  async findByApiKey(apiKey: string): Promise<PlatformDto | null> {
    const platform = await this.prisma.platform.findUnique({
      where: { apiKey },
    });

    // Solo retornar si está ACTIVE
    if (!platform || platform.statusId !== 2) return null;
    return this.mapToDto(platform);
  }

  async create(data: CreatePlatformDto): Promise<PlatformDto> {
    const platform = await this.prisma.platform.create({
      data: {
        id: data.id,
        name: data.name,
        icon: data.icon ?? null,
        apiKey: this.generateApiKey(),
        statusId: 2, // ACTIVE por defecto
      },
    });

    return this.mapToDto(platform);
  }

  async update(id: number, data: UpdatePlatformDto): Promise<PlatformDto | null> {
    try {
      const platform = await this.prisma.platform.update({
        where: { id },
        data,
      });

      return this.mapToDto(platform);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<PlatformDto | null> {
    try {
      const platform = await this.prisma.platform.update({
        where: { id },
        data: {
          statusId: 4, // DELETED
        },
      });

      return this.mapToDto(platform);
    } catch {
      return null;
    }
  }

  async regenerate(id: number): Promise<PlatformDto | null> {
    try {
      const platform = await this.prisma.platform.update({
        where: { id },
        data: {
          apiKey: this.generateApiKey(),
        },
      });

      return this.mapToDto(platform);
    } catch {
      return null;
    }
  }

  async activate(id: number): Promise<PlatformDto | null> {
    try {
      const platform = await this.prisma.platform.update({
        where: { id },
        data: {
          statusId: 2, // ACTIVE
        },
      });

      return this.mapToDto(platform);
    } catch {
      return null;
    }
  }
}
