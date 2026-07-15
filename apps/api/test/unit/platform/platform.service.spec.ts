import { describe, it, expect, beforeEach } from 'vitest';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { PlatformService } from '@platform/platform.service';
import { PlatformMemoryRepository } from '@platform/repository';
import { PlatformDto, CreatePlatformDto, UpdatePlatformDto } from '@excepio/shared';

describe('PlatformService', () => {
  let service: PlatformService;
  let repository: PlatformMemoryRepository;

  const mockPlatform: PlatformDto = {
    id: 1,
    name: 'Test Platform',
    apiKey: 'exc_abc123def456',
    statusId: 2,
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    repository = new PlatformMemoryRepository();
    service = new PlatformService(repository);
  });

  describe('findAll', () => {
    it('Given_PlatformsExist_When_FindAll_Then_ReturnsAllProjects', async () => {
      // Arrange
      repository.seed([mockPlatform]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({
        id: mockPlatform.id,
        name: mockPlatform.name,
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
      repository.seed([mockPlatform]);

      // Act
      const result = await service.findById(mockPlatform.id);

      // Assert
      expect(result).toEqual(expect.objectContaining({
        id: mockPlatform.id,
        name: mockPlatform.name,
      }));
    });

    it('Given_NonExistingId_When_FindById_Then_ThrowsNotFoundException', async () => {
      // Act & Assert
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      await expect(service.findById(999)).rejects.toThrow('Platform with id 999 not found');
    });
  });

  describe('create', () => {
    const createPlatformDto: CreatePlatformDto = {
      id: 10,
      name: 'New Project',
    };

    it('Given_ValidData_When_Create_Then_CreatesProjectWithApiKey', async () => {
      // Act
      const result = await service.create(createPlatformDto);

      // Assert
      expect(result).toEqual(expect.objectContaining({
        id: createPlatformDto.id,
        name: createPlatformDto.name,
        statusId: 2, // ACTIVE por defecto
      }));
      expect(result.apiKey).toBeDefined();
      expect(result.apiKey).toMatch(/^exc_[a-f0-9]{64}$/);
    });

    it('Given_DuplicateId_When_Create_Then_ThrowsConflictException', async () => {
      // Arrange
      repository.seed([mockPlatform]);

      // Act & Assert
      await expect(service.create({ id: mockPlatform.id, name: 'Another Platform' }))
        .rejects.toThrow(ConflictException);
      await expect(service.create({ id: mockPlatform.id, name: 'Another Platform' }))
        .rejects.toThrow(`Platform with id ${mockPlatform.id} already exists`);
    });
  });

  describe('update', () => {
    const updateDto: UpdatePlatformDto = {
      name: 'Updated Project Name',
    };

    it('Given_ExistingId_When_Update_Then_UpdatesProject', async () => {
      // Arrange
      repository.seed([mockPlatform]);

      // Act
      const result = await service.update(mockPlatform.id, updateDto);

      // Assert
      expect(result).toEqual(expect.objectContaining({
        id: mockPlatform.id,
        name: updateDto.name,
      }));
    });

    it('Given_NonExistingId_When_Update_Then_ThrowsNotFoundException', async () => {
      // Act & Assert
      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
      await expect(service.update(999, updateDto)).rejects.toThrow('Platform with id 999 not found');
    });

    it('Given_StatusIdUpdate_When_Update_Then_UpdatesStatusId', async () => {
      // Arrange
      repository.seed([mockPlatform]);
      const updateStatusDto: UpdatePlatformDto = { statusId: 3 }; // EXPIRED

      // Act
      const result = await service.update(mockPlatform.id, updateStatusDto);

      // Assert
      expect(result.statusId).toBe(3);
    });
  });

  describe('delete', () => {
    it('Given_ExistingId_When_Delete_Then_SetsStatusToDeleted', async () => {
      // Arrange
      repository.seed([mockPlatform]);

      // Act
      const result = await service.delete(mockPlatform.id);

      // Assert
      expect(result).toEqual(expect.objectContaining({
        id: mockPlatform.id,
        statusId: 4, // DELETED
      }));
    });

    it('Given_NonExistingId_When_Delete_Then_ThrowsNotFoundException', async () => {
      // Act & Assert
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
      await expect(service.delete(999)).rejects.toThrow('Platform with id 999 not found');
    });
  });

  describe('regenerate', () => {
    it('Given_ExistingId_When_Regenerate_Then_ReturnsNewApiKey', async () => {
      // Arrange
      repository.seed([mockPlatform]);
      const originalApiKey = mockPlatform.apiKey;

      // Act
      const result = await service.regenerate(mockPlatform.id);

      // Assert
      expect(result.id).toBe(mockPlatform.id);
      expect(result.apiKey).not.toBe(originalApiKey);
      expect(result.apiKey).toMatch(/^exc_[a-f0-9]{64}$/);
    });

    it('Given_NonExistingId_When_Regenerate_Then_ThrowsNotFoundException', async () => {
      // Act & Assert
      await expect(service.regenerate(999)).rejects.toThrow(NotFoundException);
      await expect(service.regenerate(999)).rejects.toThrow('Platform with id 999 not found');
    });
  });
});
