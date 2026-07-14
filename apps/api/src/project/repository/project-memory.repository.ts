import { Injectable } from '@nestjs/common';
import { ProjectDto, CreateProjectDto, UpdateProjectDto } from '@excepio/shared';
import { ProjectRepository } from './project.repository.interface';
import { randomBytes } from 'crypto';

/**
 * Implementación In-Memory del repositorio de Project.
 * Útil para tests unitarios y desarrollo sin base de datos.
 */
@Injectable()
export class ProjectMemoryRepository implements ProjectRepository {
  private projects: Map<number, ProjectDto> = new Map();

  /**
   * Limpia todos los datos del repositorio.
   * Útil para resetear entre tests.
   */
  clear(): void {
    this.projects.clear();
  }

  /**
   * Permite cargar datos de prueba.
   * @param data - Datos a cargar
   */
  seed(data: ProjectDto[]): void {
    this.clear();
    data.forEach((project) => this.projects.set(project.id, { ...project }));
  }

  /**
   * Genera una API Key segura.
   */
  private generateApiKey(): string {
    return `exc_${randomBytes(32).toString('hex')}`;
  }

  async findAll(): Promise<ProjectDto[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.statusId !== 4,
    );
  }

  async findById(id: number): Promise<ProjectDto | null> {
    const project = this.projects.get(id);
    if (!project || project.statusId === 4) return null;
    return { ...project };
  }

  async existsById(id: number): Promise<boolean> {
    return this.projects.has(id);
  }

  async findByApiKey(apiKey: string): Promise<ProjectDto | null> {
    const project = Array.from(this.projects.values()).find(
      (p) => p.apiKey === apiKey && p.statusId === 2,
    );
    if (!project) return null;
    return { ...project };
  }

  async create(data: CreateProjectDto): Promise<ProjectDto> {
    const project: ProjectDto = {
      id: data.id,
      name: data.name,
      apiKey: this.generateApiKey(),
      statusId: 2, // ACTIVE por defecto
      createdAt: new Date().toISOString(),
    };
    this.projects.set(project.id, project);
    return { ...project };
  }

  async update(id: number, data: UpdateProjectDto): Promise<ProjectDto | null> {
    const project = this.projects.get(id);
    if (!project) return null;

    const updated: ProjectDto = {
      ...project,
      ...(data.name !== undefined && { name: data.name }),
      ...(data.statusId !== undefined && { statusId: data.statusId }),
    };
    this.projects.set(id, updated);
    return { ...updated };
  }

  async delete(id: number): Promise<ProjectDto | null> {
    const project = this.projects.get(id);
    if (!project) return null;

    const deleted: ProjectDto = { ...project, statusId: 4 }; // DELETED
    this.projects.set(id, deleted);
    return { ...deleted };
  }

  async regenerate(id: number): Promise<ProjectDto | null> {
    const project = this.projects.get(id);
    if (!project) return null;

    const updated: ProjectDto = {
      ...project,
      apiKey: this.generateApiKey(),
    };
    this.projects.set(id, updated);
    return { ...updated };
  }
}
