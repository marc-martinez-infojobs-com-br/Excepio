import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PlatformController } from '@platform/platform.controller';
import { PlatformService } from '@platform/platform.service';
import {
  PlatformDto,
  CreatePlatformDto,
  UpdatePlatformDto,
} from '@excepio/shared';

describe('PlatformController', () => {
  let controller: PlatformController;
  let service: PlatformService;

  const mockPlatform: PlatformDto = {
    id: 1,
    name: 'Test Platform',
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

    controller = new PlatformController(service);
  });

  describe('findAll', () => {
    it('Given_PlatformsExist_When_FindAll_Then_ReturnsAllProjects', async () => {
      // Arrange
      const projects = [mockPlatform];
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
      vi.mocked(service.findById).mockResolvedValue(mockPlatform);

      // Act
      const result = await controller.findById(mockPlatform.id);

      // Assert
      expect(service.findById).toHaveBeenCalledWith(mockPlatform.id);
      expect(result).toEqual(mockPlatform);
    });
  });

  describe('create', () => {
    it('Given_ValidData_When_Create_Then_CreatesProject', async () => {
      // Arrange
      const createDto: CreatePlatformDto = {
        id: 10,
        name: 'New Project',
      };
      const createdProject: PlatformDto = {
        ...mockPlatform,
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
      const updateDto: UpdatePlatformDto = {
        name: 'Updated Project Name',
      };
      const updatedProject: PlatformDto = { ...mockPlatform, ...updateDto };
      vi.mocked(service.update).mockResolvedValue(updatedProject);

      // Act
      const result = await controller.update(mockPlatform.id, updateDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(mockPlatform.id, updateDto);
      expect(result).toEqual(updatedProject);
    });
  });

  describe('delete', () => {
    it('Given_ExistingId_When_Delete_Then_DeletesProject', async () => {
      // Arrange
      const deletedProject: PlatformDto = { ...mockPlatform, statusId: 4 };
      vi.mocked(service.delete).mockResolvedValue(deletedProject);

      // Act
      const result = await controller.delete(mockPlatform.id);

      // Assert
      expect(service.delete).toHaveBeenCalledWith(mockPlatform.id);
      expect(result).toEqual(deletedProject);
    });
  });

  describe('regenerate', () => {
    it('Given_ExistingId_When_Regenerate_Then_ReturnsNewApiKey', async () => {
      // Arrange
      const regeneratedProject: PlatformDto = {
        ...mockPlatform,
        apiKey: 'exc_newkey789',
      };
      vi.mocked(service.regenerate).mockResolvedValue(regeneratedProject);

      // Act
      const result = await controller.regenerate(mockPlatform.id);

      // Assert
      expect(service.regenerate).toHaveBeenCalledWith(mockPlatform.id);
      expect(result).toEqual(regeneratedProject);
    });
  });
});
