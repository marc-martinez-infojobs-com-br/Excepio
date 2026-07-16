import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExceptionController } from '@exception/exception.controller';
import { ExceptionService } from '@exception/exception.service';
import {
  ExceptionDto,
  CreateExceptionDto,
  ExceptionFilterDto,
  PlatformDto,
} from '@excepio/shared';

describe('ExceptionController', () => {
  let controller: ExceptionController;
  let service: ExceptionService;

  const mockPlatform: PlatformDto = {
    id: 1,
    name: 'Test Platform',
    apiKey: 'exc_abc123def456',
    statusId: 2,
    createdAt: new Date().toISOString(),
  };

  const mockException: ExceptionDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    platformId: 1,
    levelId: 4,
    message: 'Test error message',
    stackTrace: 'at test (test.js:1:1)',
    userId: 'user_123',
    url: '/test',
    userAgent: 'Test Agent',
    appVersion: '1.0.0',
    metadata: { test: true },
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    service = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
    } as any;

    controller = new ExceptionController(service);
  });

  describe('create', () => {
    it('Given_ValidData_When_Create_Then_CreatesException', async () => {
      // Arrange
      const createDto: CreateExceptionDto = {
        levelId: 4,
        message: 'Test error message',
        stackTrace: 'at test (test.js:1:1)',
        userId: 'user_123',
        url: '/test',
        userAgent: 'Test Agent',
        appVersion: '1.0.0',
        metadata: { test: true },
      };
      vi.mocked(service.create).mockResolvedValue(mockException);

      // Act
      const result = await controller.create(mockPlatform, createDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(mockPlatform.id, createDto);
      expect(result).toEqual(mockException);
    });

    it('Given_MinimalData_When_Create_Then_CreatesException', async () => {
      // Arrange
      const minimalDto: CreateExceptionDto = {
        levelId: 3,
        message: 'Minimal error',
      };
      const minimalException: ExceptionDto = {
        ...mockException,
        levelId: 3,
        message: 'Minimal error',
        stackTrace: null,
        userId: null,
        url: null,
        userAgent: null,
        appVersion: null,
        metadata: null,
      };
      vi.mocked(service.create).mockResolvedValue(minimalException);

      // Act
      const result = await controller.create(mockPlatform, minimalDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(mockPlatform.id, minimalDto);
      expect(result).toEqual(minimalException);
    });
  });

  describe('findAll', () => {
    it('Given_NoFilters_When_FindAll_Then_ReturnsAllExceptions', async () => {
      // Arrange
      const filters: ExceptionFilterDto = {};
      const response = {
        data: [mockException],
        total: 1,
        page: 1,
        limit: 50,
      };
      vi.mocked(service.findAll).mockResolvedValue(response);

      // Act
      const result = await controller.findAll(filters);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(response);
    });

    it('Given_ProjectIdFilter_When_FindAll_Then_ReturnsFilteredExceptions', async () => {
      // Arrange
      const filters: ExceptionFilterDto = { platformId: 1 };
      const response = {
        data: [mockException],
        total: 1,
        page: 1,
        limit: 50,
      };
      vi.mocked(service.findAll).mockResolvedValue(response);

      // Act
      const result = await controller.findAll(filters);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(response);
    });

    it('Given_MultipleFilters_When_FindAll_Then_PassesAllFiltersToService', async () => {
      // Arrange
      const filters: ExceptionFilterDto = {
        platformId: 1,
        levelId: 4,
        userId: 'user_123',
        messageSearch: 'error',
        page: 2,
        limit: 20,
      };
      const response = {
        data: [],
        total: 0,
        page: 2,
        limit: 20,
      };
      vi.mocked(service.findAll).mockResolvedValue(response);

      // Act
      const result = await controller.findAll(filters);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual(response);
    });
  });

  describe('findById', () => {
    it('Given_ExistingId_When_FindById_Then_ReturnsException', async () => {
      // Arrange
      vi.mocked(service.findById).mockResolvedValue(mockException);

      // Act
      const result = await controller.findById(mockException.id);

      // Assert
      expect(service.findById).toHaveBeenCalledWith(mockException.id);
      expect(result).toEqual(mockException);
    });
  });
});
