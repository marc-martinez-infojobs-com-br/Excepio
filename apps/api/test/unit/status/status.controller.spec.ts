import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { StatusController } from '../../../src/status/status.controller';
import { StatusService } from '../../../src/status/status.service';
import { StatusResponseDto } from '@excepio/shared';

describe('StatusController', () => {
  let controller: StatusController;
  let mockService: {
    findAll: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
  };

  // Datos de prueba
  const mockStatus: StatusResponseDto = {
    id: 1,
    name: 'PENDING',
  };

  const mockStatuses: StatusResponseDto[] = [
    { id: 1, name: 'PENDING' },
    { id: 2, name: 'ACTIVE' },
    { id: 3, name: 'EXPIRED' },
    { id: 4, name: 'DELETED' },
  ];

  beforeEach(() => {
    mockService = {
      findAll: vi.fn(),
      findById: vi.fn(),
    };

    controller = new StatusController(mockService as unknown as StatusService);
  });

  describe('GET /status', () => {
    it('Given_StatusesExist_When_FindAll_Then_ReturnsStatusArray', async () => {
      // Arrange
      mockService.findAll.mockResolvedValue(mockStatuses);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual(mockStatuses);
      expect(result).toHaveLength(4);
      expect(mockService.findAll).toHaveBeenCalledTimes(1);
    });

    it('Given_NoStatusesExist_When_FindAll_Then_ReturnsEmptyArray', async () => {
      // Arrange
      mockService.findAll.mockResolvedValue([]);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('GET /status/:id', () => {
    it('Given_ExistingId_When_FindById_Then_ReturnsStatus', async () => {
      // Arrange
      mockService.findById.mockResolvedValue(mockStatus);

      // Act
      const result = await controller.findById(1);

      // Assert
      expect(result).toEqual(mockStatus);
      expect(mockService.findById).toHaveBeenCalledWith(1);
    });

    it('Given_NonExistingId_When_FindById_Then_ThrowsNotFoundException', async () => {
      // Arrange
      mockService.findById.mockRejectedValue(new NotFoundException('Status with id 999 not found'));

      // Act & Assert
      await expect(controller.findById(999)).rejects.toThrow(NotFoundException);
    });
  });
});
