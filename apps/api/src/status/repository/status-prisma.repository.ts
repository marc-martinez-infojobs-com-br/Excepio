import { Injectable } from '@nestjs/common';
import { StatusResponseDto } from '@excepio/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { StatusRepository } from './status.repository.interface';

/**
 * Implementación del repositorio de Status usando Prisma.
 */
@Injectable()
export class StatusPrismaRepository implements StatusRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<StatusResponseDto[]> {
    const statuses = await this.prisma.status.findMany({
      orderBy: { id: 'asc' },
    });

    return statuses.map((status) => ({
      id: status.id,
      name: status.name,
    }));
  }

  async findById(id: number): Promise<StatusResponseDto | null> {
    const status = await this.prisma.status.findUnique({
      where: { id },
    });

    if (!status) {
      return null;
    }

    return {
      id: status.id,
      name: status.name,
    };
  }
}
