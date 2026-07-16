import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '@auth/auth.service';
import { UserService } from '@user/user.service';
import { UserMemoryRepository } from '@user/repository';
import {
  UserResponseDto,
  UserRole,
  RegisterBackendDto,
  LoginDto,
  LoginResponseDto,
} from '@excepio/shared';
import * as bcrypt from 'bcrypt';

// Mock bcrypt y JwtService
vi.mock('bcrypt');
vi.mock('@nestjs/jwt');

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;
  let userRepository: UserMemoryRepository;

  const mockUser: UserResponseDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.USUARIO,
    statusId: 2,
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    userRepository = new UserMemoryRepository();
    userService = new UserService(userRepository);
    jwtService = new JwtService({});
    authService = new AuthService(userService, jwtService, userRepository);
    vi.clearAllMocks();
  });

  describe('register', () => {
    const registerDto: RegisterBackendDto = {
      email: 'newuser@example.com',
      password: 'Password123!',
      name: 'New User',
    };

    it('Given_ValidRegistrationData_When_Register_Then_CreatesUserAndReturnsToken', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      const accessToken = 'jwt-token-123';

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);
      vi.spyOn(jwtService, 'sign').mockReturnValue(accessToken);

      // Act
      const result = await authService.register(registerDto);

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.access_token).toBe(accessToken);
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.name).toBe(registerDto.name);
      expect(result.user.role).toBe(UserRole.USUARIO);
      expect(result.user).not.toHaveProperty('password');
    });

    it('Given_DuplicateEmail_When_Register_Then_ThrowsConflictException', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);

      // Crear usuario primero
      await authService.register(registerDto);

      // Act & Assert
      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(authService.register(registerDto)).rejects.toThrow(
        'already exists',
      );
    });

    it('Given_ValidData_When_Register_Then_CallsBcryptHash', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      const accessToken = 'jwt-token-123';

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);
      vi.spyOn(jwtService, 'sign').mockReturnValue(accessToken);

      // Act
      await authService.register(registerDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });

    it('Given_ValidData_When_Register_Then_GeneratesJWT', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      const accessToken = 'jwt-token-123';

      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);
      const signSpy = vi.spyOn(jwtService, 'sign').mockReturnValue(accessToken);

      // Act
      const result = await authService.register(registerDto);

      // Assert
      expect(signSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: result.user.id,
          email: registerDto.email,
          role: UserRole.USUARIO,
        }),
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    beforeEach(async () => {
      // Crear un usuario para los tests de login
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      userRepository.seed([
        {
          ...mockUser,
          password: hashedPassword,
        },
      ]);
    });

    it('Given_ValidCredentials_When_Login_Then_ReturnsTokenAndUser', async () => {
      // Arrange
      const accessToken = 'jwt-token-123';
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.spyOn(jwtService, 'sign').mockReturnValue(accessToken);

      // Act
      const result = await authService.login(loginDto);

      // Assert
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('user');
      expect(result.access_token).toBe(accessToken);
      expect(result.user.email).toBe(loginDto.email);
      expect(result.user).not.toHaveProperty('password');
    });

    it('Given_InvalidEmail_When_Login_Then_ThrowsUnauthorizedException', async () => {
      // Arrange
      const invalidLoginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      // Act & Assert
      await expect(authService.login(invalidLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(invalidLoginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('Given_InvalidPassword_When_Login_Then_ThrowsUnauthorizedException', async () => {
      // Arrange
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
      const invalidLoginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      // Act & Assert
      await expect(authService.login(invalidLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(invalidLoginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });

    it('Given_ValidCredentials_When_Login_Then_UpdatesLastLoginAt', async () => {
      // Arrange
      const accessToken = 'jwt-token-123';
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.spyOn(jwtService, 'sign').mockReturnValue(accessToken);

      // Act
      await authService.login(loginDto);

      // Assert
      const user = await userRepository.findByEmail(loginDto.email);
      expect(user?.lastLoginAt).not.toBeNull();
    });

    it('Given_ValidCredentials_When_Login_Then_GeneratesJWTWithCorrectPayload', async () => {
      // Arrange
      const accessToken = 'jwt-token-123';
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      const signSpy = vi.spyOn(jwtService, 'sign').mockReturnValue(accessToken);

      // Act
      await authService.login(loginDto);

      // Assert
      expect(signSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
        }),
      );
    });

    it('Given_DeletedUser_When_Login_Then_ThrowsUnauthorizedException', async () => {
      // Arrange
      const deletedUser = {
        ...mockUser,
        statusId: 4, // DELETED
      };
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      userRepository.seed([
        {
          ...deletedUser,
          password: hashedPassword,
        },
      ]);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      // Act & Assert
      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(authService.login(loginDto)).rejects.toThrow(
        'Invalid credentials',
      );
    });
  });

  describe('validateUser', () => {
    beforeEach(async () => {
      // Crear un usuario para los tests de validación
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      userRepository.seed([
        {
          ...mockUser,
          password: hashedPassword,
        },
      ]);
    });

    it('Given_ValidCredentials_When_ValidateUser_Then_ReturnsUser', async () => {
      // Arrange
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      // Act
      const result = await authService.validateUser(
        'test@example.com',
        'Password123!',
      );

      // Assert
      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
      expect(result).not.toHaveProperty('password');
    });

    it('Given_InvalidEmail_When_ValidateUser_Then_ReturnsNull', async () => {
      // Act
      const result = await authService.validateUser(
        'nonexistent@example.com',
        'Password123!',
      );

      // Assert
      expect(result).toBeNull();
    });

    it('Given_InvalidPassword_When_ValidateUser_Then_ReturnsNull', async () => {
      // Arrange
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      // Act
      const result = await authService.validateUser(
        'test@example.com',
        'WrongPassword',
      );

      // Assert
      expect(result).toBeNull();
    });

    it('Given_DeletedUser_When_ValidateUser_Then_ReturnsNull', async () => {
      // Arrange
      const deletedUser = {
        ...mockUser,
        statusId: 4, // DELETED
      };
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      userRepository.seed([
        {
          ...deletedUser,
          password: hashedPassword,
        },
      ]);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      // Act
      const result = await authService.validateUser(
        'test@example.com',
        'Password123!',
      );

      // Assert
      expect(result).toBeNull();
    });
  });
});
