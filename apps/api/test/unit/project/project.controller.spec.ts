import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProjectController } from '../../../src/project/project.controller';
import { ProjectService } from '../../../src/project/project.service';
import { ProjectDto, CreateProjectDto, UpdateProjectDto } from '@excepio/shared';

describe('ProjectController', () => {
  let controller: ProjectController;
  let service: ProjectService;

  const mockProject: ProjectDto = {
    id: 1,
    name: 'Test Project',
    apiKey: 'exc_abc123def456',
    statusId: 2,
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    service = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      regenerate: vi.fn(),
    } as any;

    controller = new ProjectController(service);
  });

  describe('findAll', () => {
    it('Given_ProjectsExist_When_FindAll_Then_ReturnsAllProjects', async () => {
      // Arrange
      const projects = [mockProject];
      vi.mocked(service.findAll).mockResolvedValue(projects);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(projects);
    });
  });

  describe('findById', () => {
    it('Given_ExistingId_When_FindById_Then_ReturnsProject', async () => {
      // Arrange
      vi.mocked(service.findById).mockResolvedValue(mockProject);

      // Act
      const result = await controller.findById(mockProject.id);

      // Assert
      expect(service.findById).toHaveBeenCalledWith(mockProject.id);
      expect(result).toEqual(mockProject);
    });
  });

  describe('create', () => {
    it('Given_ValidData_When_Create_Then_CreatesProject', async () => {
      // Arrange
      const createDto: CreateProjectDto = {
        id: 10,
        name: 'New Project',
      };
      const createdProject: ProjectDto = {
        ...mockProject,
        id: createDto.id,
        name: createDto.name,
      };
      vi.mocked(service.create).mockResolvedValue(createdProject);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(createdProject);
    });
  });

  describe('update', () => {
    it('Given_ValidData_When_Update_Then_UpdatesProject', async () => {
      // Arrange
      const updateDto: UpdateProjectDto = {
        name: 'Updated Project Name',
      };
      const updatedProject: ProjectDto = { ...mockProject, ...updateDto };
      vi.mocked(service.update).mockResolvedValue(updatedProject);

      // Act
      const result = await controller.update(mockProject.id, updateDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(mockProject.id, updateDto);
      expect(result).toEqual(updatedProject);
    });
  });

  describe('delete', () => {
    it('Given_ExistingId_When_Delete_Then_DeletesProject', async () => {
      // Arrange
      const deletedProject: ProjectDto = { ...mockProject, statusId: 4 };
      vi.mocked(service.delete).mockResolvedValue(deletedProject);

      // Act
      const result = await controller.delete(mockProject.id);

      // Assert
      expect(service.delete).toHaveBeenCalledWith(mockProject.id);
      expect(result).toEqual(deletedProject);
    });
  });

  describe('regenerate', () => {
    it('Given_ExistingId_When_Regenerate_Then_ReturnsNewApiKey', async () => {
      // Arrange
      const regeneratedProject: ProjectDto = {
        ...mockProject,
        apiKey: 'exc_newkey789',
      };
      vi.mocked(service.regenerate).mockResolvedValue(regeneratedProject);

      // Act
      const result = await controller.regenerate(mockProject.id);

      // Assert
      expect(service.regenerate).toHaveBeenCalledWith(mockProject.id);
      expect(result).toEqual(regeneratedProject);
    });
  });
});
