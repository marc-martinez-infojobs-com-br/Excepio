import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthController } from '../../../src/auth/auth.controller';
import { AuthService } from '../../../src/auth/auth.service';
import { RegisterBackendDto, LoginDto, LoginResponseDto, UserRole } from '@excepio/shared';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockLoginResponse: LoginResponseDto = {
    access_token: 'jwt-token-123',
    user: {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      name: 'Test User',
      role: UserRole.USUARIO,
      statusId: 2,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };

  beforeEach(() => {
    service = {
      register: vi.fn(),
      login: vi.fn(),
    } as any;

    controller = new AuthController(service);
  });

  describe('register', () => {
    it('Given_ValidRegistrationData_When_Register_Then_ReturnsTokenAndUser', async () => {
      // Arrange
      const registerDto: RegisterBackendDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        name: 'New User',
      };
      vi.mocked(service.register).mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.register(registerDto);

      // Assert
      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockLoginResponse);
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
    });
  });

  describe('login', () => {
    it('Given_ValidCredentials_When_Login_Then_ReturnsTokenAndUser', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      vi.mocked(service.login).mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.login(loginDto);

      // Assert
      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(mockLoginResponse);
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
    });
  });

  describe('getProfile', () => {
    it('Given_AuthenticatedUser_When_GetProfile_Then_ReturnsUser', async () => {
      // Arrange
      const mockRequest = {
        user: mockLoginResponse.user,
      };

      // Act
      const result = await controller.getProfile(mockRequest);

      // Assert
      expect(result).toEqual(mockLoginResponse.user);
    });
  });
});
