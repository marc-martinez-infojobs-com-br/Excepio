import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserController } from '@user/user.controller';
import { UserService } from '@user/user.service';
import { UserResponseDto, UserRole, CreateUserDto, UpdateUserDto } from '@excepio/shared';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

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
    service = {
      findAll: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as any;

    controller = new UserController(service);
  });

  describe('findAll', () => {
    it('Given_UsersExist_When_FindAll_Then_ReturnsAllUsers', async () => {
      // Arrange
      const users = [mockUser];
      vi.mocked(service.findAll).mockResolvedValue(users);

      // Act
      const result = await controller.findAll();

      // Assert
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findById', () => {
    it('Given_ExistingId_When_FindById_Then_ReturnsUser', async () => {
      // Arrange
      vi.mocked(service.findById).mockResolvedValue(mockUser);

      // Act
      const result = await controller.findById(mockUser.id);

      // Assert
      expect(service.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    it('Given_ValidData_When_Create_Then_CreatesUser', async () => {
      // Arrange
      const createDto: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        name: 'New User',
        role: UserRole.USUARIO,
      };
      const createdUser: UserResponseDto = { ...mockUser, ...createDto };
      vi.mocked(service.create).mockResolvedValue(createdUser);

      // Act
      const result = await controller.create(createDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(createdUser);
    });
  });

  describe('update', () => {
    it('Given_ValidData_When_Update_Then_UpdatesUser', async () => {
      // Arrange
      const updateDto: UpdateUserDto = {
        name: 'Updated Name',
      };
      const updatedUser: UserResponseDto = { ...mockUser, ...updateDto };
      vi.mocked(service.update).mockResolvedValue(updatedUser);

      // Act
      const result = await controller.update(mockUser.id, updateDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(mockUser.id, updateDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('delete', () => {
    it('Given_ExistingId_When_Delete_Then_DeletesUser', async () => {
      // Arrange
      const deletedUser: UserResponseDto = { ...mockUser, statusId: 4 };
      vi.mocked(service.delete).mockResolvedValue(deletedUser);

      // Act
      const result = await controller.delete(mockUser.id);

      // Assert
      expect(service.delete).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(deletedUser);
    });
  });
});
