import { describe, it, expect, beforeEach } from 'vitest';
import { ExceptionMemoryRepository } from '@exception/repository';
import type { ExceptionDto } from '@excepio/shared';

describe('ExceptionMemoryRepository', () => {
  let repository: ExceptionMemoryRepository;

  const baseException: ExceptionDto = {
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
    repository = new ExceptionMemoryRepository();
  });

  describe('countAffectedUsers', () => {
    it('Given_MultipleExceptionsWithSameMessage_When_CountAffectedUsers_Then_ReturnsDistinctUserCount', async () => {
      // Arrange: 3 excepciones con el mismo mensaje, pero solo 2 usuarios distintos
      const exceptions: ExceptionDto[] = [
        { ...baseException, id: 'id-1', userId: 'user-1', message: 'Error X' },
        { ...baseException, id: 'id-2', userId: 'user-2', message: 'Error X' },
        { ...baseException, id: 'id-3', userId: 'user-1', message: 'Error X' }, // Repetido
        { ...baseException, id: 'id-4', userId: 'user-3', message: 'Different Error' }, // Mensaje diferente
      ];
      repository.seed(exceptions);

      // Act
      const result = await repository.countAffectedUsers('Error X');

      // Assert
      expect(result).toBe(2); // user-1 y user-2
    });

    it('Given_NoMatchingMessage_When_CountAffectedUsers_Then_ReturnsZero', async () => {
      // Arrange
      const exceptions: ExceptionDto[] = [
        { ...baseException, id: 'id-1', userId: 'user-1', message: 'Error A' },
      ];
      repository.seed(exceptions);

      // Act
      const result = await repository.countAffectedUsers('Non existent error');

      // Assert
      expect(result).toBe(0);
    });

    it('Given_ExceptionsWithNullUserId_When_CountAffectedUsers_Then_ExcludesNullUsers', async () => {
      // Arrange
      const exceptions: ExceptionDto[] = [
        { ...baseException, id: 'id-1', userId: 'user-1', message: 'Error X' },
        { ...baseException, id: 'id-2', userId: null, message: 'Error X' }, // null userId
        { ...baseException, id: 'id-3', userId: 'user-2', message: 'Error X' },
      ];
      repository.seed(exceptions);

      // Act
      const result = await repository.countAffectedUsers('Error X');

      // Assert
      expect(result).toBe(2); // Solo user-1 y user-2, null no cuenta
    });

    it('Given_AllExceptionsWithNullUserId_When_CountAffectedUsers_Then_ReturnsZero', async () => {
      // Arrange
      const exceptions: ExceptionDto[] = [
        { ...baseException, id: 'id-1', userId: null, message: 'Error X' },
        { ...baseException, id: 'id-2', userId: null, message: 'Error X' },
      ];
      repository.seed(exceptions);

      // Act
      const result = await repository.countAffectedUsers('Error X');

      // Assert
      expect(result).toBe(0);
    });

    it('Given_SingleUserWithMultipleExceptions_When_CountAffectedUsers_Then_ReturnsOne', async () => {
      // Arrange: mismo usuario con múltiples excepciones del mismo error
      const exceptions: ExceptionDto[] = [
        { ...baseException, id: 'id-1', userId: 'user-1', message: 'Error X' },
        { ...baseException, id: 'id-2', userId: 'user-1', message: 'Error X' },
        { ...baseException, id: 'id-3', userId: 'user-1', message: 'Error X' },
      ];
      repository.seed(exceptions);

      // Act
      const result = await repository.countAffectedUsers('Error X');

      // Assert
      expect(result).toBe(1); // Solo 1 usuario distinto
    });

    it('Given_CaseSensitiveMessage_When_CountAffectedUsers_Then_MatchesExactly', async () => {
      // Arrange
      const exceptions: ExceptionDto[] = [
        { ...baseException, id: 'id-1', userId: 'user-1', message: 'Error X' },
        { ...baseException, id: 'id-2', userId: 'user-2', message: 'error x' }, // lowercase
      ];
      repository.seed(exceptions);

      // Act
      const result = await repository.countAffectedUsers('Error X');

      // Assert
      expect(result).toBe(1); // Solo coincide exactamente "Error X"
    });
  });
});
