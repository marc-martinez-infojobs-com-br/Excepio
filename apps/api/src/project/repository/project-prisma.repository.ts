import { Injectable } from '@nestjs/common';
import { ProjectDto, CreateProjectDto, UpdateProjectDto } from '@excepio/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectRepository } from './project.repository.interface';
import { randomBytes } from 'crypto';

/**
 * Implementación del repositorio de Project usando Prisma.
 */
@Injectable()
export class ProjectPrismaRepository implements ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera una API Key segura.
   */
  private generateApiKey(): string {
    return `exc_${randomBytes(32).toString('hex')}`;
  }

  /**
   * Mapea un Project de Prisma a ProjectDto.
   */
  private mapToDto(project: any): ProjectDto {
    return {
      id: project.id,
      name: project.name,
      apiKey: project.apiKey,
      statusId: project.statusId,
      createdAt: project.createdAt.toISOString(),
    };
  }

  async findAll(): Promise<ProjectDto[]> {
    const projects = await this.prisma.project.findMany({
      where: { statusId: { not: 4 } }, // Excluir DELETED
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((project) => this.mapToDto(project));
  }

  async findById(id: number): Promise<ProjectDto | null> {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project || project.statusId === 4) return null;
    return this.mapToDto(project);
  }

  async existsById(id: number): Promise<boolean> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });

    return project !== null;
  }

  async findByApiKey(apiKey: string): Promise<ProjectDto | null> {
    const project = await this.prisma.project.findUnique({
      where: { apiKey },
    });

    // Solo retornar si está ACTIVE
    if (!project || project.statusId !== 2) return null;
    return this.mapToDto(project);
  }

  async create(data: CreateProjectDto): Promise<ProjectDto> {
    const project = await this.prisma.project.create({
      data: {
        id: data.id,
        name: data.name,
        apiKey: this.generateApiKey(),
        statusId: 2, // ACTIVE por defecto
      },
    });

    return this.mapToDto(project);
  }

  async update(id: number, data: UpdateProjectDto): Promise<ProjectDto | null> {
    try {
      const project = await this.prisma.project.update({
        where: { id },
        data,
      });

      return this.mapToDto(project);
    } catch {
      return null;
    }
  }

  async delete(id: number): Promise<ProjectDto | null> {
    try {
      const project = await this.prisma.project.update({
        where: { id },
        data: {
          statusId: 4, // DELETED
        },
      });

      return this.mapToDto(project);
    } catch {
      return null;
    }
  }

  async regenerate(id: number): Promise<ProjectDto | null> {
    try {
      const project = await this.prisma.project.update({
        where: { id },
        data: {
          apiKey: this.generateApiKey(),
        },
      });

      return this.mapToDto(project);
    } catch {
      return null;
    }
  }
}
