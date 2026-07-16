import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from '@user/user.service';
import { UserMemoryRepository } from '@user/repository';
import {
  UserResponseDto,
  UserRole,
  CreateUserDto,
  UpdateUserDto,
} from '@excepio/shared';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
vi.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let repository: UserMemoryRepository;

  const mockUser: UserResponseDto & { password: string } = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    password: 'hashedPassword123',
    name: 'Test User',
    role: UserRole.USUARIO,
    statusId: 2,
    lastLoginAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    repository = new UserMemoryRepository();
    service = new UserService(repository);
    vi.clearAllMocks();
  });

  describe('findAll', () => {
    it('Given_UsersExist_When_FindAll_Then_ReturnsAllUsers', async () => {
      // Arrange
      repository.seed([mockUser]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        }),
      );
      expect(result[0]).not.toHaveProperty('password');
    });

    it('Given_NoUsers_When_FindAll_Then_ReturnsEmptyArray', async () => {
      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('Given_ExistingId_When_FindById_Then_ReturnsUser', async () => {
      // Arrange
      repository.seed([mockUser]);

      // Act
      const result = await service.findById(mockUser.id);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        }),
      );
      expect(result).not.toHaveProperty('password');
    });

    it('Given_NonExistingId_When_FindById_Then_ThrowsNotFoundException', async () => {
      // Act & Assert
      await expect(service.findById('non-existing-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findById('non-existing-id')).rejects.toThrow(
        'User with id non-existing-id not found',
      );
    });
  });

  describe('findByEmail', () => {
    it('Given_ExistingEmail_When_FindByEmail_Then_ReturnsUser', async () => {
      // Arrange
      repository.seed([mockUser]);

      // Act
      const result = await service.findByEmail(mockUser.email);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          email: mockUser.email,
        }),
      );
    });

    it('Given_NonExistingEmail_When_FindByEmail_Then_ThrowsNotFoundException', async () => {
      // Act & Assert
      await expect(
        service.findByEmail('nonexisting@example.com'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'newuser@example.com',
      password: 'Password123!',
      name: 'New User',
      role: UserRole.USUARIO,
    };

    it('Given_ValidData_When_Create_Then_CreatesUserWithHashedPassword', async () => {
      // Arrange
      const hashedPassword = 'hashedPassword123';
      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(result).toEqual(
        expect.objectContaining({
          email: createUserDto.email,
          name: createUserDto.name,
          role: createUserDto.role,
        }),
      );
      expect(result).not.toHaveProperty('password');
    });

    it('Given_DuplicateEmail_When_Create_Then_ThrowsConflictException', async () => {
      // Arrange
      repository.seed([mockUser]);

      // Act & Assert
      await expect(
        service.create({ ...createUserDto, email: mockUser.email }),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.create({ ...createUserDto, email: mockUser.email }),
      ).rejects.toThrow('User with email test@example.com already exists');
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = {
      name: 'Updated Name',
    };

    it('Given_ExistingId_When_Update_Then_UpdatesUser', async () => {
      // Arrange
      repository.seed([mockUser]);

      // Act
      const result = await service.update(mockUser.id, updateDto);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          name: updateDto.name,
        }),
      );
    });

    it('Given_NonExistingId_When_Update_Then_ThrowsNotFoundException', async () => {
      // Act & Assert
      await expect(
        service.update('non-existing-id', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('Given_ExistingId_When_Delete_Then_SetsStatusToDeleted', async () => {
      // Arrange
      repository.seed([mockUser]);

      // Act
      const result = await service.delete(mockUser.id);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          statusId: 4, // DELETED
        }),
      );
    });

    it('Given_NonExistingId_When_Delete_Then_ThrowsNotFoundException', async () => {
      // Act & Assert
      await expect(service.delete('non-existing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resetPassword', () => {
    it('Given_ExistingUser_When_ResetPassword_Then_UpdatesPasswordWithHash', async () => {
      // Arrange
      repository.seed([mockUser]);
      const newPassword = 'NewPassword123!';
      const hashedPassword = 'hashedNewPassword123';
      vi.mocked(bcrypt.hash).mockResolvedValue(hashedPassword as never);

      // Act
      const result = await service.resetPassword(mockUser.id, newPassword);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        }),
      );
      expect(result).not.toHaveProperty('password');
    });

    it('Given_NonExistingUser_When_ResetPassword_Then_ThrowsNotFoundException', async () => {
      // Act & Assert
      await expect(
        service.resetPassword('non-existing-id', 'NewPassword123!'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.resetPassword('non-existing-id', 'NewPassword123!'),
      ).rejects.toThrow('User with id non-existing-id not found');
    });
  });
});
