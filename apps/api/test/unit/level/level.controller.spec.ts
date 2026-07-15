import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { LevelController } from '@level/level.controller';
import { LevelService } from '@level/level.service';
import { LevelResponseDto } from '@excepio/shared';

describe('LevelController', () => {
  let controller: LevelController;
  let mockService: {
    findAll: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
  };

  // Datos de prueba
  const mockLevel: LevelResponseDto = {
    id: 1,
    name: 'DEBUG',
    order: 1,
    statusId: 2,
  };

  const mockLevels: LevelResponseDto[] = [
    { id: 1, name: 'DEBUG', order: 1, statusId: 2 },
    { id: 2, name: 'INFO', order: 2, statusId: 2 },
    { id: 3, name: 'WARNING', order: 3, statusId: 2 },
  ];

  beforeEach(() => {
    mockService = {
      findAll: vi.fn(),
      findById: vi.fn(),
    };

    controller = new LevelController(mockService as unknown as LevelService);
  });

  describe('GET /levels', () => {
    it('Given_LevelsExist_When_FindAll_Then_ReturnsLevelArray', async () => {
      // Arrange
      mockService.findAll.mockResolvedValue(mockLevels);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(mockLevels);
      expect(result).toHaveLength(3);
      expect(mockService.findAll).toHaveBeenCalledTimes(1);
    });

    it('Given_NoLevelsExist_When_FindAll_Then_ReturnsEmptyArray', async () => {
      // Arrange
      mockService.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('GET /levels/:id', () => {
    it('Given_ExistingId_When_FindById_Then_ReturnsLevel', async () => {
      // Arrange
      mockService.findById.mockResolvedValue(mockLevel);

      // Act
      const result = await controller.findById(1);

      // Assert
      expect(result).toEqual(mockLevel);
      expect(mockService.findById).toHaveBeenCalledWith(1);
    });

    it('Given_NonExistingId_When_FindById_Then_ThrowsNotFoundException', async () => {
      // Arrange
      mockService.findById.mockRejectedValue(new NotFoundException('Level with id 999 not found'));

      // Act & Assert
      await expect(controller.findById(999)).rejects.toThrow(NotFoundException);
    });
  });
});
