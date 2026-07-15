import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { NestFactory } from '@nestjs/core';
import { Module, INestApplication, Controller, Get, Post, Patch, Delete, Param, Body, Injectable, Inject, ParseIntPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { PlatformDto, CreatePlatformDto, UpdatePlatformDto, STATUS_ID } from '@excepio/shared';
import { PlatformMemoryRepository, PLATFORM_REPOSITORY } from '@platform/repository';
import type { PlatformRepository } from '@platform/repository';

const TEST_PROJECT_SERVICE = Symbol('TEST_PROJECT_SERVICE');

// Recreamos el servicio y controller inline para evitar problemas con metadata
@Injectable()
class TestPlatformService {
  constructor(@Inject(PLATFORM_REPOSITORY) private readonly repo: PlatformRepository) {}

  async findAll(): Promise<PlatformDto[]> {
    return this.repo.findAll();
  }

  async findById(id: number): Promise<PlatformDto> {
    const project = await this.repo.findById(id);
    if (!project) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException(`Project with id ${id} not found`);
    }
    return project;
  }

  async create(createPlatformDto: CreatePlatformDto): Promise<PlatformDto> {
    const exists = await this.repo.existsById(createPlatformDto.id);
    if (exists) {
      const { ConflictException } = await import('@nestjs/common');
      throw new ConflictException(`Project with id ${createPlatformDto.id} already exists`);
    }
    return this.repo.create(createPlatformDto);
  }

  async update(id: number, updatePlatformDto: UpdatePlatformDto): Promise<PlatformDto> {
    const project = await this.repo.update(id, updatePlatformDto);
    if (!project) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException(`Project with id ${id} not found`);
    }
    return project;
  }

  async delete(id: number): Promise<PlatformDto> {
    const project = await this.repo.delete(id);
    if (!project) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException(`Project with id ${id} not found`);
    }
    return project;
  }

  async regenerate(id: number): Promise<PlatformDto> {
    const project = await this.repo.regenerate(id);
    if (!project) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException(`Project with id ${id} not found`);
    }
    return project;
  }
}

@Controller('projects')
class TestPlatformController {
  constructor(@Inject(TEST_PROJECT_SERVICE) private readonly projectService: TestPlatformService) {}

  @Get()
  async findAll(): Promise<PlatformDto[]> {
    return this.projectService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<PlatformDto> {
    return this.projectService.findById(id);
  }

  @Post()
  async create(@Body() createPlatformDto: CreatePlatformDto): Promise<PlatformDto> {
    return this.projectService.create(createPlatformDto);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updatePlatformDto: UpdatePlatformDto): Promise<PlatformDto> {
    return this.projectService.update(id, updatePlatformDto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number): Promise<PlatformDto> {
    return this.projectService.delete(id);
  }

  @Post(':id/regenerate')
  async regenerate(@Param('id', ParseIntPipe) id: number): Promise<PlatformDto> {
    return this.projectService.regenerate(id);
  }
}

// Instancia compartida del repositorio para poder hacer seed/clear
let sharedRepository: PlatformMemoryRepository;

@Module({
  controllers: [TestPlatformController],
  providers: [
    {
      provide: TEST_PROJECT_SERVICE,
      useClass: TestPlatformService,
    },
    {
      provide: PLATFORM_REPOSITORY,
      useFactory: () => {
        sharedRepository = new PlatformMemoryRepository();
        return sharedRepository;
      },
    },
  ],
})
class TestPlatformModule {}

describe('Project CRUD (integration)', () => {
  let app: INestApplication<App>;
  let createdProjectId: number;

  beforeAll(async () => {
    app = await NestFactory.create(TestPlatformModule, { logger: false });
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    sharedRepository.clear();
  });

  describe('POST /api/projects', () => {
    it('Given_ValidProjectData_When_CreateProject_Then_ReturnsCreatedProject', async () => {
      // Arrange
      const createPlatformDto: CreatePlatformDto = {
        id: 100,
        name: 'Test Platform',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/projects')
        .send(createPlatformDto)
        .expect(201);

      // Assert
      const project: PlatformDto = response.body;
      expect(project.id).toBe(createPlatformDto.id);
      expect(project.name).toBe(createPlatformDto.name);
      expect(project.apiKey).toBeDefined();
      expect(project.apiKey).toMatch(/^exc_[a-f0-9]{64}$/);
      expect(project.statusId).toBe(STATUS_ID.ACTIVE);
      expect(project.createdAt).toBeDefined();

      createdProjectId = project.id;
    });

    it('Given_DuplicateId_When_CreateProject_Then_Returns409', async () => {
      // Arrange
      const createPlatformDto: CreatePlatformDto = {
        id: 101,
        name: 'First Project',
      };
      await request(app.getHttpServer())
        .post('/api/projects')
        .send(createPlatformDto)
        .expect(201);

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/projects')
        .send({ id: 101, name: 'Duplicate Project' })
        .expect(409);
    });
  });

  describe('GET /api/projects', () => {
    it('Given_ProjectsExist_When_GetAllProjects_Then_ReturnsAllProjects', async () => {
      // Arrange
      sharedRepository.seed([
        { id: 1, name: 'Project 1', apiKey: 'exc_key1', statusId: 2, createdAt: new Date().toISOString() },
        { id: 2, name: 'Project 2', apiKey: 'exc_key2', statusId: 2, createdAt: new Date().toISOString() },
      ]);

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/projects')
        .expect(200);

      // Assert
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('apiKey');
    });

    it('Given_NoProjects_When_GetAllProjects_Then_ReturnsEmptyArray', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/projects')
        .expect(200);

      // Assert
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('Given_ExistingId_When_GetProjectById_Then_ReturnsProject', async () => {
      // Arrange
      sharedRepository.seed([
        { id: 1, name: 'Project 1', apiKey: 'exc_key1', statusId: 2, createdAt: new Date().toISOString() },
      ]);

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/projects/1')
        .expect(200);

      // Assert
      expect(response.body.id).toBe(1);
      expect(response.body.name).toBe('Project 1');
    });

    it('Given_NonExistingId_When_GetProjectById_Then_Returns404', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/api/projects/999')
        .expect(404);
    });
  });

  describe('PATCH /api/projects/:id', () => {
    it('Given_ExistingProject_When_UpdateProject_Then_ReturnsUpdatedProject', async () => {
      // Arrange
      sharedRepository.seed([
        { id: 1, name: 'Original Name', apiKey: 'exc_key1', statusId: 2, createdAt: new Date().toISOString() },
      ]);
      const updateDto: UpdatePlatformDto = { name: 'Updated Name' };

      // Act
      const response = await request(app.getHttpServer())
        .patch('/api/projects/1')
        .send(updateDto)
        .expect(200);

      // Assert
      expect(response.body.name).toBe('Updated Name');
      expect(response.body.id).toBe(1);
    });

    it('Given_NonExistingId_When_UpdateProject_Then_Returns404', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .patch('/api/projects/999')
        .send({ name: 'New Name' })
        .expect(404);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('Given_ExistingProject_When_DeleteProject_Then_SetsStatusToDeleted', async () => {
      // Arrange
      sharedRepository.seed([
        { id: 1, name: 'Project to Delete', apiKey: 'exc_key1', statusId: 2, createdAt: new Date().toISOString() },
      ]);

      // Act
      const response = await request(app.getHttpServer())
        .delete('/api/projects/1')
        .expect(200);

      // Assert
      expect(response.body.statusId).toBe(STATUS_ID.DELETED);
    });

    it('Given_NonExistingId_When_DeleteProject_Then_Returns404', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .delete('/api/projects/999')
        .expect(404);
    });
  });

  describe('POST /api/projects/:id/regenerate', () => {
    it('Given_ExistingProject_When_RegenerateApiKey_Then_ReturnsNewApiKey', async () => {
      // Arrange
      const originalApiKey = 'exc_originalkey123';
      sharedRepository.seed([
        { id: 1, name: 'Project', apiKey: originalApiKey, statusId: 2, createdAt: new Date().toISOString() },
      ]);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/projects/1/regenerate')
        .expect(201);

      // Assert
      expect(response.body.id).toBe(1);
      expect(response.body.apiKey).not.toBe(originalApiKey);
      expect(response.body.apiKey).toMatch(/^exc_[a-f0-9]{64}$/);
    });

    it('Given_NonExistingId_When_RegenerateApiKey_Then_Returns404', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/projects/999/regenerate')
        .expect(404);
    });
  });
});
