import { describe, it, expect, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { LevelService } from '@level/level.service';
import { LevelMemoryRepository } from '@level/repository';
import { LevelResponseDto } from '@excepio/shared';

describe('LevelService', () => {
  let service: LevelService;
  let repository: LevelMemoryRepository;

  // Datos de prueba
  const existingLevels: LevelResponseDto[] = [
    { id: 1, name: 'DEBUG', order: 1, statusId: 2 },
    { id: 2, name: 'INFO', order: 2, statusId: 2 },
    { id: 3, name: 'WARNING', order: 3, statusId: 2 },
    { id: 4, name: 'ERROR', order: 4, statusId: 4 }, // DELETED
  ];

  beforeEach(() => {
    repository = new LevelMemoryRepository();
    repository.seed(existingLevels);
    service = new LevelService(repository);
  });

  describe('findAll', () => {
    it('Given_ActiveLevelsExist_When_FindAll_Then_ReturnsOnlyActiveLevels', async () => {
      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(3); // Solo DEBUG, INFO, WARNING (no ERROR que está DELETED)
      expect(result.every((level) => level.statusId !== 4)).toBe(true);
    });

    it('Given_NoActiveLevels_When_FindAll_Then_ReturnsEmptyArray', async () => {
      // Arrange
      repository.clear();

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('Given_ExistingId_When_FindById_Then_ReturnsLevel', async () => {
      // Act
      const result = await service.findById(1);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe('DEBUG');
    });

    it('Given_NonExistingId_When_FindById_Then_ThrowsNotFoundException', async () => {
      // Act & Assert
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });

    it('Given_DeletedLevelId_When_FindById_Then_ReturnsLevel', async () => {
      // Nota: findById devuelve el level aunque esté eliminado
      // La lógica de negocio puede decidir qué hacer con él

      // Act
      const result = await service.findById(4); // ERROR está DELETED

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(4);
      expect(result.statusId).toBe(4); // DELETED
    });
  });
});
