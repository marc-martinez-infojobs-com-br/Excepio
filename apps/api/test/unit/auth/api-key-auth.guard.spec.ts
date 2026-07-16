import { describe, it, expect, beforeEach } from 'vitest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeyAuthGuard } from '@auth/guards/api-key-auth.guard';
import { PlatformMemoryRepository } from '@platform/repository';
import { PlatformDto } from '@excepio/shared';

describe('ApiKeyAuthGuard', () => {
  let guard: ApiKeyAuthGuard;
  let platformRepository: PlatformMemoryRepository;

  const mockActivePlatform: PlatformDto = {
    id: 1,
    name: 'Test Platform',
    apiKey:
      'exc_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    statusId: 2, // ACTIVE
    createdAt: new Date().toISOString(),
  };

  const mockDeletedPlatform: PlatformDto = {
    id: 2,
    name: 'Deleted Platform',
    apiKey:
      'exc_deleted1234567890abcdef1234567890abcdef1234567890abcdef12345678',
    statusId: 4, // DELETED
    createdAt: new Date().toISOString(),
  };

  const createMockExecutionContext = (apiKey?: string): ExecutionContext => {
    const mockRequest = {
      headers: apiKey ? { 'x-api-key': apiKey } : {},
      platform: undefined,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  beforeEach(() => {
    platformRepository = new PlatformMemoryRepository();
    platformRepository.seed([mockActivePlatform, mockDeletedPlatform]);
    guard = new ApiKeyAuthGuard(platformRepository);
  });

  describe('canActivate', () => {
    it('Given_NoApiKeyHeader_When_CanActivate_Then_ThrowsUnauthorizedException', async () => {
      // Arrange
      const context = createMockExecutionContext();

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'API Key is required',
      );
    });

    it('Given_EmptyApiKeyHeader_When_CanActivate_Then_ThrowsUnauthorizedException', async () => {
      // Arrange
      const context = createMockExecutionContext('');

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'API Key is required',
      );
    });

    it('Given_InvalidApiKey_When_CanActivate_Then_ThrowsUnauthorizedException', async () => {
      // Arrange
      const context = createMockExecutionContext(
        'exc_invalid_api_key_that_does_not_exist',
      );

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Invalid API Key',
      );
    });

    it('Given_ApiKeyOfDeletedProject_When_CanActivate_Then_ThrowsUnauthorizedException', async () => {
      // Arrange
      const context = createMockExecutionContext(mockDeletedPlatform.apiKey);

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(guard.canActivate(context)).rejects.toThrow(
        'Invalid API Key',
      );
    });

    it('Given_ValidApiKey_When_CanActivate_Then_ReturnsTrue', async () => {
      // Arrange
      const context = createMockExecutionContext(mockActivePlatform.apiKey);

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('Given_ValidApiKey_When_CanActivate_Then_AttachesProjectToRequest', async () => {
      // Arrange
      const mockRequest = {
        headers: { 'x-api-key': mockActivePlatform.apiKey },
        platform: undefined as PlatformDto | undefined,
      };

      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // Act
      await guard.canActivate(context);

      // Assert
      expect(mockRequest.platform).toBeDefined();
      expect(mockRequest.platform?.id).toBe(mockActivePlatform.id);
      expect(mockRequest.platform?.name).toBe(mockActivePlatform.name);
      expect(mockRequest.platform?.apiKey).toBe(mockActivePlatform.apiKey);
    });
  });
});
