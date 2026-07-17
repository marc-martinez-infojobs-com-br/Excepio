import { describe, it, expect } from 'vitest';
import { ExceptionDetailSchema } from '../exception.dto';

describe('ExceptionDetailSchema', () => {
  const validExceptionDetail = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    platformId: 1,
    levelId: 4,
    message: 'NullReferenceException: Object reference not set',
    stackTrace: 'at MyApp.Service.Process() in /src/Service.cs:42',
    userId: 'user-123',
    url: '/api/login',
    userAgent: 'Mozilla/5.0',
    appVersion: 'v2.4.1',
    metadata: { browser: 'Chrome', os: 'Windows' },
    createdAt: '2024-01-15T10:30:00.000Z',
    affectedUsersCount: 150,
  };

  describe('valid data', () => {
    it('should accept a valid exception detail with all fields', () => {
      const result = ExceptionDetailSchema.safeParse(validExceptionDetail);
      expect(result.success).toBe(true);
    });

    it('should accept exception detail with optional fields as null', () => {
      const result = ExceptionDetailSchema.safeParse({
        ...validExceptionDetail,
        stackTrace: null,
        userId: null,
        url: null,
        userAgent: null,
        appVersion: null,
        metadata: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept exception detail with affectedUsersCount as 0', () => {
      const result = ExceptionDetailSchema.safeParse({
        ...validExceptionDetail,
        affectedUsersCount: 0,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('affectedUsersCount validation', () => {
    it('should reject negative affectedUsersCount', () => {
      const result = ExceptionDetailSchema.safeParse({
        ...validExceptionDetail,
        affectedUsersCount: -1,
      });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer affectedUsersCount', () => {
      const result = ExceptionDetailSchema.safeParse({
        ...validExceptionDetail,
        affectedUsersCount: 1.5,
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing affectedUsersCount', () => {
      const { affectedUsersCount, ...withoutCount } = validExceptionDetail;
      const result = ExceptionDetailSchema.safeParse(withoutCount);
      expect(result.success).toBe(false);
    });
  });

  describe('inherited ExceptionSchema validations', () => {
    it('should reject invalid UUID for id', () => {
      const result = ExceptionDetailSchema.safeParse({
        ...validExceptionDetail,
        id: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const result = ExceptionDetailSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        affectedUsersCount: 10,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid datetime format', () => {
      const result = ExceptionDetailSchema.safeParse({
        ...validExceptionDetail,
        createdAt: 'invalid-date',
      });
      expect(result.success).toBe(false);
    });
  });
});
