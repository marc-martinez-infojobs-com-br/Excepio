import { describe, it, expect, beforeEach } from 'vitest';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { ProjectService } from '../../../src/project/project.service';
import { ProjectMemoryRepository } from '../../../src/project/repository';
import { ProjectDto, CreateProjectDto, UpdateProjectDto } from '@excepio/shared';

describe('ProjectService', () => {
  let service: ProjectService;
  let repository: ProjectMemoryRepository;

  const mockProject: ProjectDto = {
    id: 1,
    name: 'Test Project',
    apiKey: 'exc_abc123def456',
    statusId: 2,
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    repository = new ProjectMemoryRepository();
    service = new ProjectService(repository);
  });

  describe('findAll', () => {
    it('Given_ProjectsExist_When_FindAll_Then_ReturnsAllProjects', async () => {
      // Arrange
      repository.seed([mockProject]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({
        id: mockProject.id,
        name: mockProject.name,
      }));
    });

    it('Given_NoProjects_When_FindAll_Then_ReturnsEmptyArray', async () => {
      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('Given_ExistingId_When_FindById_Then_ReturnsProject', async () => {
      // Arrange
      repository.seed([mockProject]);

      // Act
      const result = await service.findById(mockProject.id);

      // Assert
      expect(result).toEqual(expect.objectContaining({
        id: mockProject.id,
        name: mockProject.name,
      }));
    });

    it('Given_NonExistingId_When_FindById_Then_ThrowsNotFoundException', async () => {
      // Act & Assert
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      await expect(service.findById(999)).rejects.toThrow('Project with id 999 not found');
    });
  });

  describe('create', () => {
    const createProjectDto: CreateProjectDto = {
      id: 10,
      name: 'New Project',
    };

    it('Given_ValidData_When_Create_Then_CreatesProjectWithApiKey', async () => {
      // Act
      const result = await service.create(createProjectDto);

      // Assert
      expect(result).toEqual(expect.objectContaining({
        id: createProjectDto.id,
        name: createProjectDto.name,
        statusId: 2, // ACTIVE por defecto
      }));
      expect(result.apiKey).toBeDefined();
      expect(result.apiKey).toMatch(/^exc_[a-f0-9]{64}$/);
    });

    it('Given_DuplicateId_When_Create_Then_ThrowsConflictException', async () => {
      // Arrange
      repository.seed([mockProject]);

      // Act & Assert
      await expect(service.create({ id: mockProject.id, name: 'Another Project' }))
        .rejects.toThrow(ConflictException);
      await expect(service.create({ id: mockProject.id, name: 'Another Project' }))
        .rejects.toThrow(`Project with id ${mockProject.id} already exists`);
    });
  });

  describe('update', () => {
    const updateDto: UpdateProjectDto = {
      name: 'Updated Project Name',
    };

    it('Given_ExistingId_When_Update_Then_UpdatesProject', async () => {
      // Arrange
      repository.seed([mockProject]);

      // Act
      const result = await service.update(mockProject.id, updateDto);

      // Assert
      expect(result).toEqual(expect.objectContaining({
        id: mockProject.id,
        name: updateDto.name,
      }));
    });

    it('Given_NonExistingId_When_Update_Then_ThrowsNotFoundException', async () => {
      // Act & Assert
      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(999, updateDto)).rejects.toThrow('Project with id 999 not found');
    });

    it('Given_StatusIdUpdate_When_Update_Then_UpdatesStatusId', async () => {
      // Arrange
      repository.seed([mockProject]);
      const updateStatusDto: UpdateProjectDto = { statusId: 3 }; // EXPIRED

      // Act
      const result = await service.update(mockProject.id, updateStatusDto);

      // Assert
      expect(result.statusId).toBe(3);
    });
  });

  describe('delete', () => {
    it('Given_ExistingId_When_Delete_Then_SetsStatusToDeleted', async () => {
      // Arrange
      repository.seed([mockProject]);

      // Act
      const result = await service.delete(mockProject.id);

      // Assert
      expect(result).toEqual(expect.objectContaining({
        id: mockProject.id,
        statusId: 4, // DELETED
      }));
    });

    it('Given_NonExistingId_When_Delete_Then_ThrowsNotFoundException', async () => {
      // Act & Assert
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
      await expect(service.delete(999)).rejects.toThrow('Project with id 999 not found');
    });
  });

  describe('regenerate', () => {
    it('Given_ExistingId_When_Regenerate_Then_ReturnsNewApiKey', async () => {
      // Arrange
      repository.seed([mockProject]);
      const originalApiKey = mockProject.apiKey;

      // Act
      const result = await service.regenerate(mockProject.id);

      // Assert
      expect(result.id).toBe(mockProject.id);
      expect(result.apiKey).not.toBe(originalApiKey);
      expect(result.apiKey).toMatch(/^exc_[a-f0-9]{64}$/);
    });

    it('Given_NonExistingId_When_Regenerate_Then_ThrowsNotFoundException', async () => {
      // Act & Assert
      await expect(service.regenerate(999)).rejects.toThrow(NotFoundException);
      await expect(service.regenerate(999)).rejects.toThrow('Project with id 999 not found');
    });
  });
});
