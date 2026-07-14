import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import type { ProjectDto, CreateProjectDto, UpdateProjectDto } from '@excepio/shared';
import type { ProjectRepository } from './repository';
import { PROJECT_REPOSITORY } from './repository';

/**
 * Servicio para gestionar proyectos.
 */
@Injectable()
export class ProjectService {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  /**
   * Obtiene todos los proyectos.
   * @returns Lista de proyectos
   */
  async findAll(): Promise<ProjectDto[]> {
    return this.projectRepository.findAll();
  }

  /**
   * Busca un proyecto por su ID.
   * @param id - ID del proyecto a buscar
   * @returns El proyecto encontrado
   * @throws NotFoundException si el proyecto no existe
   */
  async findById(id: number): Promise<ProjectDto> {
    const project = await this.projectRepository.findById(id);
    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }
    return project;
  }

  /**
   * Crea un nuevo proyecto.
   * @param createProjectDto - Datos del proyecto a crear
   * @returns El proyecto creado con apiKey generada
   * @throws ConflictException si el ID ya existe
   */
  async create(createProjectDto: CreateProjectDto): Promise<ProjectDto> {
    const exists = await this.projectRepository.existsById(createProjectDto.id);
    if (exists) {
      throw new ConflictException(`Project with id ${createProjectDto.id} already exists`);
    }

    return this.projectRepository.create(createProjectDto);
  }

  /**
   * Actualiza un proyecto existente.
   * @param id - ID del proyecto a actualizar
   * @param updateProjectDto - Datos a actualizar
   * @returns El proyecto actualizado
   * @throws NotFoundException si el proyecto no existe
   */
  async update(id: number, updateProjectDto: UpdateProjectDto): Promise<ProjectDto> {
    const project = await this.projectRepository.update(id, updateProjectDto);
    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }
    return project;
  }

  /**
   * Elimina un proyecto (borrado lógico).
   * @param id - ID del proyecto a eliminar
   * @returns El proyecto eliminado
   * @throws NotFoundException si el proyecto no existe
   */
  async delete(id: number): Promise<ProjectDto> {
    const project = await this.projectRepository.delete(id);
    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }
    return project;
  }

  /**
   * Regenera la API Key de un proyecto.
   * @param id - ID del proyecto
   * @returns El proyecto con la nueva API Key
   * @throws NotFoundException si el proyecto no existe
   */
  async regenerate(id: number): Promise<ProjectDto> {
    const project = await this.projectRepository.regenerate(id);
    if (!project) {
      throw new NotFoundException(`Project with id ${id} not found`);
    }
    return project;
  }
}
