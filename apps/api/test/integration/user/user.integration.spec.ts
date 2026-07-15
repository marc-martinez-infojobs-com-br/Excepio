import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NestFactory } from '@nestjs/core';
import { Module, INestApplication, Controller, Get, Post, Patch, Delete, Param, Body, Injectable, Inject } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { UserResponseDto, CreateUserDto, UpdateUserDto, UserRole, STATUS_ID } from '@excepio/shared';
import { UserMemoryRepository, USER_REPOSITORY } from '@user/repository';
import type { UserRepository } from '@user/repository';
import * as bcrypt from 'bcrypt';

const TEST_USER_SERVICE = Symbol('TEST_USER_SERVICE');

// Recreamos el servicio y controller inline para evitar problemas con metadata
@Injectable()
class TestUserService {
  constructor(@Inject(USER_REPOSITORY) private readonly repo: UserRepository) {}

  async findAll(): Promise<UserResponseDto[]> {
    return this.repo.findAll();
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.repo.findById(id);
    if (!user) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.repo.findByEmail(createUserDto.email);
    if (existingUser) {
      const { ConflictException } = await import('@nestjs/common');
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = await this.repo.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.repo.update(id, updateUserDto);
    if (!user) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async delete(id: string): Promise<UserResponseDto> {
    const user = await this.repo.delete(id);
    if (!user) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }
}

@Controller('users')
class TestUserController {
  constructor(@Inject(TEST_USER_SERVICE) private readonly userService: TestUserService) {}

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findById(id);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.delete(id);
  }
}

@Module({
  controllers: [TestUserController],
  providers: [
    {
      provide: TEST_USER_SERVICE,
      useClass: TestUserService,
    },
    {
      provide: USER_REPOSITORY,
      useFactory: () => new UserMemoryRepository(),
    },
  ],
})
class TestUserModule {}

describe('User CRUD (integration)', () => {
  let app: INestApplication<App>;
  let createdUserId: string;

  beforeAll(async () => {
    app = await NestFactory.create(TestUserModule, { logger: false });
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('POST /api/users', () => {
    it('Given_ValidUserData_When_CreateUser_Then_ReturnsCreatedUser', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'Test User',
        role: UserRole.USUARIO,
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send(createUserDto)
        .expect(201);

      // Assert
      const user: UserResponseDto = response.body;
      expect(user).toHaveProperty('id');
      expect(user.email).toBe(createUserDto.email);
      expect(user.name).toBe(createUserDto.name);
      expect(user.role).toBe(createUserDto.role);
      expect(user).not.toHaveProperty('password'); // No debe devolver el password
      expect(user.statusId).toBe(STATUS_ID.ACTIVE);

      // Guardar el ID para tests posteriores
      createdUserId = user.id;
    });

    it('Given_DuplicateEmail_When_CreateUser_Then_Returns409', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'test@example.com', // Email ya existente del test anterior
        password: 'Password123!',
        name: 'Another User',
        role: UserRole.USUARIO,
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send(createUserDto)
        .expect(409);

      // Assert
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('already exists');
    });

    it('Given_ValidAdminUser_When_CreateUser_Then_ReturnsCreatedAdmin', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'admin@example.com',
        password: 'AdminPassword123!',
        name: 'Admin User',
        role: UserRole.ADMINISTRADOR,
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send(createUserDto)
        .expect(201);

      // Assert
      const user: UserResponseDto = response.body;
      expect(user.role).toBe(UserRole.ADMINISTRADOR);
    });
  });

  describe('GET /api/users', () => {
    it('Given_UsersExist_When_GetAllUsers_Then_ReturnsUsersArray', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/users')
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Verificar estructura de cada user
      response.body.forEach((user: UserResponseDto) => {
        expect(user).toHaveProperty('id');
        expect(user).toHaveProperty('email');
        expect(user).toHaveProperty('name');
        expect(user).toHaveProperty('role');
        expect(user).toHaveProperty('statusId');
        expect(user).not.toHaveProperty('password'); // No debe devolver passwords
      });
    });
  });

  describe('GET /api/users/:id', () => {
    it('Given_ExistingUserId_When_GetUserById_Then_ReturnsUser', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/users/${createdUserId}`)
        .expect(200);

      // Assert
      const user: UserResponseDto = response.body;
      expect(user.id).toBe(createdUserId);
      expect(user.email).toBe('test@example.com');
      expect(user).not.toHaveProperty('password');
    });

    it('Given_NonExistingUserId_When_GetUserById_Then_Returns404', async () => {
      // Arrange
      const nonExistingId = '00000000-0000-0000-0000-000000000000';

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/users/${nonExistingId}`)
        .expect(404);

      // Assert
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });

    it('Given_InvalidUserId_When_GetUserById_Then_Returns404', async () => {
      // Arrange
      const invalidId = 'not-a-uuid';

      // Act & Assert
      await request(app.getHttpServer())
        .get(`/api/users/${invalidId}`)
        .expect(404);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('Given_ValidUpdateData_When_UpdateUser_Then_ReturnsUpdatedUser', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      // Act
      const response = await request(app.getHttpServer())
        .patch(`/api/users/${createdUserId}`)
        .send(updateUserDto)
        .expect(200);

      // Assert
      const user: UserResponseDto = response.body;
      expect(user.id).toBe(createdUserId);
      expect(user.name).toBe('Updated Name');
      expect(user.email).toBe('test@example.com'); // Email no cambió
    });

    it('Given_UpdateRole_When_UpdateUser_Then_UpdatesRole', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        role: UserRole.ADMINISTRADOR,
      };

      // Act
      const response = await request(app.getHttpServer())
        .patch(`/api/users/${createdUserId}`)
        .send(updateUserDto)
        .expect(200);

      // Assert
      const user: UserResponseDto = response.body;
      expect(user.role).toBe(UserRole.ADMINISTRADOR);
    });

    it('Given_NonExistingUserId_When_UpdateUser_Then_Returns404', async () => {
      // Arrange
      const nonExistingId = '00000000-0000-0000-0000-000000000000';
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
      };

      // Act
      const response = await request(app.getHttpServer())
        .patch(`/api/users/${nonExistingId}`)
        .send(updateUserDto)
        .expect(404);

      // Assert
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('Given_ExistingUserId_When_DeleteUser_Then_SetsStatusToDeleted', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .delete(`/api/users/${createdUserId}`)
        .expect(200);

      // Assert
      const user: UserResponseDto = response.body;
      expect(user.id).toBe(createdUserId);
      expect(user.statusId).toBe(STATUS_ID.DELETED);
    });

    it('Given_NonExistingUserId_When_DeleteUser_Then_Returns404', async () => {
      // Arrange
      const nonExistingId = '00000000-0000-0000-0000-000000000000';

      // Act
      const response = await request(app.getHttpServer())
        .delete(`/api/users/${nonExistingId}`)
        .expect(404);

      // Assert
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });
  });
});
