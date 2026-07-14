import { describe, it, expect, beforeEach } from 'vitest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ApiKeyAuthGuard } from '../../../src/auth/guards/api-key-auth.guard';
import { ProjectMemoryRepository } from '../../../src/project/repository';
import { ProjectDto } from '@excepio/shared';

describe('ApiKeyAuthGuard', () => {
  let guard: ApiKeyAuthGuard;
  let projectRepository: ProjectMemoryRepository;

  const mockActiveProject: ProjectDto = {
    id: 1,
    name: 'Test Project',
    apiKey: 'exc_1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    statusId: 2, // ACTIVE
    createdAt: new Date().toISOString(),
  };

  const mockDeletedProject: ProjectDto = {
    id: 2,
    name: 'Deleted Project',
    apiKey: 'exc_deleted1234567890abcdef1234567890abcdef1234567890abcdef12345678',
    statusId: 4, // DELETED
    createdAt: new Date().toISOString(),
  };

  const createMockExecutionContext = (apiKey?: string): ExecutionContext => {
    const mockRequest = {
      headers: apiKey ? { 'x-api-key': apiKey } : {},
      project: undefined,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  beforeEach(() => {
    projectRepository = new ProjectMemoryRepository();
    projectRepository.seed([mockActiveProject, mockDeletedProject]);
    guard = new ApiKeyAuthGuard(projectRepository);
  });

  describe('canActivate', () => {
    it('Given_NoApiKeyHeader_When_CanActivate_Then_ThrowsUnauthorizedException', async () => {
      // Arrange
      const context = createMockExecutionContext();

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('API Key is required');
    });

    it('Given_EmptyApiKeyHeader_When_CanActivate_Then_ThrowsUnauthorizedException', async () => {
      // Arrange
      const context = createMockExecutionContext('');

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('API Key is required');
    });

    it('Given_InvalidApiKey_When_CanActivate_Then_ThrowsUnauthorizedException', async () => {
      // Arrange
      const context = createMockExecutionContext('exc_invalid_api_key_that_does_not_exist');

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid API Key');
    });

    it('Given_ApiKeyOfDeletedProject_When_CanActivate_Then_ThrowsUnauthorizedException', async () => {
      // Arrange
      const context = createMockExecutionContext(mockDeletedProject.apiKey);

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
      await expect(guard.canActivate(context)).rejects.toThrow('Invalid API Key');
    });

    it('Given_ValidApiKey_When_CanActivate_Then_ReturnsTrue', async () => {
      // Arrange
      const context = createMockExecutionContext(mockActiveProject.apiKey);

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
    });

    it('Given_ValidApiKey_When_CanActivate_Then_AttachesProjectToRequest', async () => {
      // Arrange
      const mockRequest = {
        headers: { 'x-api-key': mockActiveProject.apiKey },
        project: undefined as ProjectDto | undefined,
      };

      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      // Act
      await guard.canActivate(context);

      // Assert
      expect(mockRequest.project).toBeDefined();
      expect(mockRequest.project?.id).toBe(mockActiveProject.id);
      expect(mockRequest.project?.name).toBe(mockActiveProject.name);
      expect(mockRequest.project?.apiKey).toBe(mockActiveProject.apiKey);
    });
  });
});
