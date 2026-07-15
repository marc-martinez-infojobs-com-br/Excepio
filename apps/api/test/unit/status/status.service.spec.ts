import { describe, it, expect, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { StatusService } from '@status/status.service';
import { StatusMemoryRepository } from '@status/repository';
import { StatusResponseDto } from '@excepio/shared';

describe('StatusService', () => {
  let service: StatusService;
  let repository: StatusMemoryRepository;

  // Datos de prueba
  const existingStatuses: StatusResponseDto[] = [
    { id: 1, name: 'PENDING' },
    { id: 2, name: 'ACTIVE' },
    { id: 3, name: 'EXPIRED' },
    { id: 4, name: 'DELETED' },
  ];

  beforeEach(() => {
    repository = new StatusMemoryRepository();
    repository.seed(existingStatuses);
    service = new StatusService(repository);
  });

  describe('findAll', () => {
    it('Given_StatusesExist_When_FindAll_Then_ReturnsAllStatuses', async () => {
      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(4);
      expect(result).toEqual(existingStatuses);
    });

    it('Given_NoStatuses_When_FindAll_Then_ReturnsEmptyArray', async () => {
      // Arrange
      repository.clear();

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('Given_ExistingId_When_FindById_Then_ReturnsStatus', async () => {
      // Act
      const result = await service.findById(1);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe('PENDING');
    });

    it('Given_NonExistingId_When_FindById_Then_ThrowsNotFoundException', async () => {
      // Act & Assert
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });

    it('Given_ExistingId_When_FindById_Then_ReturnsCorrectStatus', async () => {
      // Act
      const result = await service.findById(2);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(2);
      expect(result.name).toBe('ACTIVE');
    });
  });
});
