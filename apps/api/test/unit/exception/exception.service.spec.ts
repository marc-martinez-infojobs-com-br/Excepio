import { describe, it, expect, beforeEach } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { ExceptionService } from '@exception/exception.service';
import { ExceptionMemoryRepository } from '@exception/repository';
import { PlatformMemoryRepository } from '@platform/repository';
import { LevelMemoryRepository } from '@level/repository';
import {
  ExceptionDto,
  CreateExceptionDto,
  ExceptionFilterDto,
} from '@excepio/shared';

describe('ExceptionService', () => {
  let service: ExceptionService;
  let exceptionRepository: ExceptionMemoryRepository;
  let platformRepository: PlatformMemoryRepository;
  let levelRepository: LevelMemoryRepository;

  const mockException: ExceptionDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    platformId: 1,
    levelId: 4,
    message: 'NullPointerException: Cannot read property of undefined',
    stackTrace: 'at getUserData (app.js:45:12)',
    userId: 'user_12345',
    url: '/api/users/profile',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0',
    appVersion: '1.2.3',
    metadata: { action: 'getData', timestamp: 1234567890 },
    createdAt: new Date().toISOString(),
  };

  beforeEach(() => {
    exceptionRepository = new ExceptionMemoryRepository();
    platformRepository = new PlatformMemoryRepository();
    levelRepository = new LevelMemoryRepository();
    
    // Seed level data for tests
    levelRepository.seed([
      { id: 1, name: 'DEBUG', statusId: 2 },
      { id: 2, name: 'INFO', statusId: 2 },
      { id: 3, name: 'WARNING', statusId: 2 },
      { id: 4, name: 'ERROR', statusId: 2 },
      { id: 5, name: 'FATAL', statusId: 2 },
    ]);
    
    // Seed platform data for tests
    platformRepository.seed([
      { id: 1, name: 'Web App', apiKey: 'test-key', statusId: 2, icon: 'LuGlobe', createdAt: new Date().toISOString() },
    ]);
    
    service = new ExceptionService(exceptionRepository, platformRepository, levelRepository);
  });

  describe('create', () => {
    const createExceptionDto: CreateExceptionDto = {
      levelId: 4,
      message: 'Test error message',
      stackTrace: 'at test (test.js:1:1)',
      userId: 'user_123',
      url: '/test',
      userAgent: 'Test Agent',
      appVersion: '1.0.0',
      metadata: { test: true },
    };

    it('Given_ValidData_When_Create_Then_CreatesException', async () => {
      // Act
      const result = await service.create(1, createExceptionDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.platformId).toBe(1);
      expect(result.levelId).toBe(4);
      expect(result.message).toBe(createExceptionDto.message);
      expect(result.stackTrace).toBe(createExceptionDto.stackTrace);
      expect(result.userId).toBe(createExceptionDto.userId);
      expect(result.url).toBe(createExceptionDto.url);
      expect(result.userAgent).toBe(createExceptionDto.userAgent);
      expect(result.appVersion).toBe(createExceptionDto.appVersion);
      expect(result.metadata).toEqual(createExceptionDto.metadata);
      expect(result.createdAt).toBeDefined();
    });

    it('Given_InvalidLevelId_When_Create_Then_UsesLevel2Default', async () => {
      // Arrange
      const invalidDto: CreateExceptionDto = {
        ...createExceptionDto,
        levelId: 10, // Inválido (fuera de rango 1-5)
      };

      // Act
      const result = await service.create(1, invalidDto);

      // Assert
      expect(result.levelId).toBe(2); // INFO por defecto
    });

    it('Given_LevelIdZero_When_Create_Then_UsesLevel2Default', async () => {
      // Arrange
      const invalidDto: CreateExceptionDto = {
        ...createExceptionDto,
        levelId: 0,
      };

      // Act
      const result = await service.create(1, invalidDto);

      // Assert
      expect(result.levelId).toBe(2); // INFO por defecto
    });

    it('Given_MinimalData_When_Create_Then_CreatesExceptionWithNullOptionalFields', async () => {
      // Arrange
      const minimalDto: CreateExceptionDto = {
        levelId: 3,
        message: 'Minimal error',
      };

      // Act
      const result = await service.create(1, minimalDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.message).toBe('Minimal error');
      expect(result.levelId).toBe(3);
      expect(result.stackTrace).toBeNull();
      expect(result.userId).toBeNull();
      expect(result.url).toBeNull();
      expect(result.userAgent).toBeNull();
      expect(result.appVersion).toBeNull();
      expect(result.metadata).toBeNull();
    });
  });

  describe('findById', () => {
    it('Given_ExistingId_When_FindById_Then_ReturnsException', async () => {
      // Arrange
      exceptionRepository.seed([mockException]);

      // Act
      const result = await service.findById(mockException.id);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: mockException.id,
          message: mockException.message,
          platformId: mockException.platformId,
        }),
      );
    });

    it('Given_NonExistingId_When_FindById_Then_ThrowsNotFoundException', async () => {
      // Arrange
      const nonExistingId = '999e4567-e89b-12d3-a456-426614174999';

      // Act & Assert
      await expect(service.findById(nonExistingId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findById(nonExistingId)).rejects.toThrow(
        `Exception with id ${nonExistingId} not found`,
      );
    });
  });

  describe('findAll', () => {
    const exception1: ExceptionDto = {
      ...mockException,
      id: '111e4567-e89b-12d3-a456-426614174111',
      platformId: 1,
      levelId: 4,
      message: 'Error 1',
      userId: 'user_1',
      createdAt: new Date('2026-07-14T10:00:00Z').toISOString(),
    };

    const exception2: ExceptionDto = {
      ...mockException,
      id: '222e4567-e89b-12d3-a456-426614174222',
      platformId: 2,
      levelId: 3,
      message: 'Warning 2',
      userId: 'user_2',
      createdAt: new Date('2026-07-14T11:00:00Z').toISOString(),
    };

    const exception3: ExceptionDto = {
      ...mockException,
      id: '333e4567-e89b-12d3-a456-426614174333',
      platformId: 1,
      levelId: 5,
      message: 'Fatal error 3',
      userId: 'user_1',
      createdAt: new Date('2026-07-14T12:00:00Z').toISOString(),
    };

    beforeEach(() => {
      exceptionRepository.seed([exception1, exception2, exception3]);
    });

    it('Given_NoFilters_When_FindAll_Then_ReturnsAllExceptionsPaginated', async () => {
      // Arrange
      const filters: ExceptionFilterDto = {};

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(result.data).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it('Given_ProjectIdFilter_When_FindAll_Then_ReturnsFilteredExceptions', async () => {
      // Arrange
      const filters: ExceptionFilterDto = { platformId: 1 };

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.data.every((e) => e.platformId === 1)).toBe(true);
    });

    it('Given_LevelIdFilter_When_FindAll_Then_ReturnsFilteredExceptions', async () => {
      // Arrange
      const filters: ExceptionFilterDto = { levelId: 4 };

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.data[0].levelId).toBe(4);
    });

    it('Given_UserIdFilter_When_FindAll_Then_ReturnsExactMatch', async () => {
      // Arrange
      const filters: ExceptionFilterDto = { userId: 'user_1' };

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.data.every((e) => e.userId === 'user_1')).toBe(true);
    });

    it('Given_MessageSearch_When_FindAll_Then_ReturnsMatchingExceptions', async () => {
      // Arrange
      const filters: ExceptionFilterDto = { messageSearch: 'error' };

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(
        result.data.every((e) => e.message.toLowerCase().includes('error')),
      ).toBe(true);
    });

    it('Given_DateRange_When_FindAll_Then_ReturnsFilteredExceptions', async () => {
      // Arrange
      const filters: ExceptionFilterDto = {
        startDate: new Date('2026-07-14T10:30:00Z').toISOString(),
        endDate: new Date('2026-07-14T11:30:00Z').toISOString(),
      };

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(exception2.id);
    });

    it('Given_Pagination_When_FindAll_Then_ReturnsPaginatedResults', async () => {
      // Arrange
      const filters: ExceptionFilterDto = { page: 1, limit: 2 };

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(2);
    });

    it('Given_SecondPage_When_FindAll_Then_ReturnsSecondPageResults', async () => {
      // Arrange
      const filters: ExceptionFilterDto = { page: 2, limit: 2 };

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(3);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(2);
    });

    it('Given_NoPaginationParams_When_FindAll_Then_UsesDefaults', async () => {
      // Arrange
      const filters: ExceptionFilterDto = {};

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(result.page).toBe(1);
      expect(result.limit).toBe(50);
    });

    it('Given_OrderByCreatedAt_When_FindAll_Then_ReturnsDescendingOrder', async () => {
      // Arrange
      const filters: ExceptionFilterDto = {};

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(result.data[0].id).toBe(exception3.id); // Más reciente primero
      expect(result.data[1].id).toBe(exception2.id);
      expect(result.data[2].id).toBe(exception1.id);
    });
  });

  describe('findByIdWithDetails', () => {
    it('Given_ExistingId_When_FindByIdWithDetails_Then_ReturnsExceptionWithAffectedUsersCount', async () => {
      // Arrange: 3 excepciones con el mismo mensaje, 2 usuarios distintos
      const exceptions: ExceptionDto[] = [
        { ...mockException, id: 'id-1', userId: 'user-1', message: 'Error X' },
        { ...mockException, id: 'id-2', userId: 'user-2', message: 'Error X' },
        { ...mockException, id: 'id-3', userId: 'user-1', message: 'Error X' }, // Repetido
      ];
      exceptionRepository.seed(exceptions);

      // Act
      const result = await service.findByIdWithDetails('id-1');

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: 'id-1',
          message: 'Error X',
          affectedUsersCount: 2, // user-1 y user-2
        }),
      );
    });

    it('Given_ExceptionWithUniqueMessage_When_FindByIdWithDetails_Then_ReturnsCorrectCount', async () => {
      // Arrange: solo 1 excepción con ese mensaje
      exceptionRepository.seed([mockException]);

      // Act
      const result = await service.findByIdWithDetails(mockException.id);

      // Assert
      expect(result.affectedUsersCount).toBe(1);
    });

    it('Given_ExceptionWithNullUserId_When_FindByIdWithDetails_Then_ReturnsZeroAffectedUsers', async () => {
      // Arrange: excepción sin userId
      const exceptionNoUser: ExceptionDto = {
        ...mockException,
        userId: null,
      };
      exceptionRepository.seed([exceptionNoUser]);

      // Act
      const result = await service.findByIdWithDetails(mockException.id);

      // Assert
      expect(result.affectedUsersCount).toBe(0);
    });

    it('Given_NonExistingId_When_FindByIdWithDetails_Then_ThrowsNotFoundException', async () => {
      // Arrange
      const nonExistingId = '999e4567-e89b-12d3-a456-426614174999';

      // Act & Assert
      await expect(service.findByIdWithDetails(nonExistingId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('Given_ExistingId_When_FindByIdWithDetails_Then_IncludesAllExceptionFields', async () => {
      // Arrange
      exceptionRepository.seed([mockException]);

      // Act
      const result = await service.findByIdWithDetails(mockException.id);

      // Assert
      expect(result.id).toBe(mockException.id);
      expect(result.platformId).toBe(mockException.platformId);
      expect(result.levelId).toBe(mockException.levelId);
      expect(result.message).toBe(mockException.message);
      expect(result.stackTrace).toBe(mockException.stackTrace);
      expect(result.userId).toBe(mockException.userId);
      expect(result.url).toBe(mockException.url);
      expect(result.userAgent).toBe(mockException.userAgent);
      expect(result.appVersion).toBe(mockException.appVersion);
      expect(result.metadata).toEqual(mockException.metadata);
      expect(result.createdAt).toBe(mockException.createdAt);
      expect(typeof result.affectedUsersCount).toBe('number');
    });
  });
});
