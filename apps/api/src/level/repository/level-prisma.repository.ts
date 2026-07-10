import { Injectable } from '@nestjs/common';
import { LevelResponseDto, STATUS_ID } from '@excepio/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { LevelRepository } from './level.repository.interface';

/**
 * Implementación del repositorio de Level usando Prisma.
 */
@Injectable()
export class LevelPrismaRepository implements LevelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<LevelResponseDto[]> {
    const levels = await this.prisma.level.findMany({
      orderBy: { order: 'asc' },
    });

    return levels.map((level) => ({
      id: level.id,
      name: level.name,
      order: level.order,
      statusId: level.statusId,
    }));
  }

  async findAllActive(): Promise<LevelResponseDto[]> {
    const levels = await this.prisma.level.findMany({
      where: {
        statusId: {
          not: STATUS_ID.DELETED,
        },
      },
      orderBy: { order: 'asc' },
    });

    return levels.map((level) => ({
      id: level.id,
      name: level.name,
      order: level.order,
      statusId: level.statusId,
    }));
  }

  async findById(id: number): Promise<LevelResponseDto | null> {
    const level = await this.prisma.level.findUnique({
      where: { id },
    });

    if (!level) {
      return null;
    }

    return {
      id: level.id,
      name: level.name,
      order: level.order,
      statusId: level.statusId,
    };
  }
}
