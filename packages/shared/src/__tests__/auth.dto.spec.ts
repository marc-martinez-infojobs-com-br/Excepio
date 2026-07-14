import { describe, it, expect } from 'vitest';
import { RegisterSchema } from '../auth.dto';

describe('RegisterSchema', () => {
  describe('email validation', () => {
    it('should accept a valid email', () => {
      const result = RegisterSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        name: 'Test User',
      });
      expect(result.success).toBe(true);
    });

    it('should reject an invalid email', () => {
      const result = RegisterSchema.safeParse({
        email: 'invalid-email',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('name validation', () => {
    it('should accept a valid name', () => {
      const result = RegisterSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        name: 'Test User',
      });
      expect(result.success).toBe(true);
    });

    it('should reject an empty name', () => {
      const result = RegisterSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        name: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('password strength validation', () => {
    it('should accept a valid strong password', () => {
      const result = RegisterSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        name: 'Test User',
      });
      expect(result.success).toBe(true);
    });

    it('should reject a password with less than 8 characters', () => {
      const result = RegisterSchema.safeParse({
        email: 'test@example.com',
        password: 'Pass1!',
        confirmPassword: 'Pass1!',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
    });

    it('should reject a password without uppercase letter', () => {
      const result = RegisterSchema.safeParse({
        email: 'test@example.com',
        password: 'password1!',
        confirmPassword: 'password1!',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
    });

    it('should reject a password without lowercase letter', () => {
      const result = RegisterSchema.safeParse({
        email: 'test@example.com',
        password: 'PASSWORD1!',
        confirmPassword: 'PASSWORD1!',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
    });

    it('should reject a password without a number', () => {
      const result = RegisterSchema.safeParse({
        email: 'test@example.com',
        password: 'Password!',
        confirmPassword: 'Password!',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
    });

    it('should reject a password without a special character', () => {
      const result = RegisterSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1',
        confirmPassword: 'Password1',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('password confirmation validation', () => {
    it('should accept matching passwords', () => {
      const result = RegisterSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1!',
        confirmPassword: 'Password1!',
        name: 'Test User',
      });
      expect(result.success).toBe(true);
    });

    it('should reject non-matching passwords', () => {
      const result = RegisterSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1!',
        confirmPassword: 'DifferentPassword1!',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('error messages', () => {
    it('should return generic error message for weak password', () => {
      const result = RegisterSchema.safeParse({
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues;
        const passwordError = issues.find(
          (e) => e.path.includes('password')
        );
        expect(passwordError?.message).toBe(
          'La contraseña no cumple los requisitos de seguridad'
        );
      }
    });

    it('should return error message for non-matching passwords', () => {
      const result = RegisterSchema.safeParse({
        email: 'test@example.com',
        password: 'Password1!',
        confirmPassword: 'DifferentPassword1!',
        name: 'Test User',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues;
        const confirmError = issues.find(
          (e) => e.path.includes('confirmPassword')
        );
        expect(confirmError?.message).toBe('Las contraseñas no coinciden');
      }
    });
  });
});
