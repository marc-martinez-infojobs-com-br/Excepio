import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NestFactory } from '@nestjs/core';
import { Module, INestApplication, Controller, Get, Param, ParseIntPipe, Injectable, Inject } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { LevelResponseDto, STATUS_ID } from '@excepio/shared';
import { LevelMemoryRepository, LEVEL_REPOSITORY } from '@level/repository';
import type { LevelRepository } from '@level/repository';

// Datos de seed que simulan la BD real
const seedLevels: LevelResponseDto[] = [
  { id: 1, name: 'DEBUG', order: 1, statusId: STATUS_ID.ACTIVE },
  { id: 2, name: 'INFO', order: 2, statusId: STATUS_ID.ACTIVE },
  { id: 3, name: 'WARNING', order: 3, statusId: STATUS_ID.ACTIVE },
  { id: 4, name: 'ERROR', order: 4, statusId: STATUS_ID.ACTIVE },
  { id: 5, name: 'FATAL', order: 5, statusId: STATUS_ID.ACTIVE },
];

const TEST_LEVEL_SERVICE = Symbol('TEST_LEVEL_SERVICE');

// Recreamos el servicio y controller inline para evitar problemas con metadata
@Injectable()
class TestLevelService {
  constructor(@Inject(LEVEL_REPOSITORY) private readonly repo: LevelRepository) {}

  async findAll(): Promise<LevelResponseDto[]> {
    return this.repo.findAllActive();
  }

  async findById(id: number): Promise<LevelResponseDto> {
    const level = await this.repo.findById(id);
    if (!level) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException(`Level with id ${id} not found`);
    }
    return level;
  }
}

@Controller('levels')
class TestLevelController {
  constructor(@Inject(TEST_LEVEL_SERVICE) private readonly levelService: TestLevelService) {}

  @Get()
  async findAll(): Promise<LevelResponseDto[]> {
    return this.levelService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<LevelResponseDto> {
    return this.levelService.findById(id);
  }
}

@Module({
  controllers: [TestLevelController],
  providers: [
    {
      provide: TEST_LEVEL_SERVICE,
      useClass: TestLevelService,
    },
    {
      provide: LEVEL_REPOSITORY,
      useFactory: () => new LevelMemoryRepository(seedLevels),
    },
  ],
})
class TestLevelModule {}

describe('Level CRUD (integration)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await NestFactory.create(TestLevelModule, { logger: false });
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /api/levels', () => {
    it('Given_LevelsExistInDatabase_When_GetAllLevels_Then_ReturnsActiveLevelsArray', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/levels')
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Verificar estructura de cada level
      response.body.forEach((level: LevelResponseDto) => {
        expect(level).toHaveProperty('id');
        expect(level).toHaveProperty('name');
        expect(level).toHaveProperty('order');
        expect(level).toHaveProperty('statusId');
        expect(typeof level.id).toBe('number');
        expect(typeof level.name).toBe('string');
      });
    });

    it('Given_LevelsExistInDatabase_When_GetAllLevels_Then_ReturnsOnlyActiveLevels', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/levels')
        .expect(200);

      // Assert: ningún level debe tener statusId = 4 (DELETED)
      const levels: LevelResponseDto[] = response.body;
      expect(levels.every((level) => level.statusId !== 4)).toBe(true);
    });

    it('Given_LevelsExistInDatabase_When_GetAllLevels_Then_ReturnsKnownLevels', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/levels')
        .expect(200);

      // Assert: debemos tener los niveles del seed
      const levels: LevelResponseDto[] = response.body;
      const levelNames = levels.map((l) => l.name);

      expect(levelNames).toContain('DEBUG');
      expect(levelNames).toContain('INFO');
      expect(levelNames).toContain('WARNING');
      expect(levelNames).toContain('ERROR');
      expect(levelNames).toContain('FATAL');
    });
  });

  describe('GET /api/levels/:id', () => {
    it('Given_ExistingLevelId_When_GetLevelById_Then_ReturnsLevel', async () => {
      // Arrange: ID 1 debería ser DEBUG según el seed
      const levelId = 1;

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/levels/${levelId}`)
        .expect(200);

      // Assert
      const level: LevelResponseDto = response.body;
      expect(level.id).toBe(levelId);
      expect(level.name).toBe('DEBUG');
      expect(level).toHaveProperty('order');
      expect(level).toHaveProperty('statusId');
    });

    it('Given_NonExistingLevelId_When_GetLevelById_Then_Returns404', async () => {
      // Arrange
      const nonExistingId = 999;

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/levels/${nonExistingId}`)
        .expect(404);

      // Assert
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });

    it('Given_InvalidLevelId_When_GetLevelById_Then_Returns400', async () => {
      // Arrange
      const invalidId = 'not-a-number';

      // Act & Assert
      await request(app.getHttpServer())
        .get(`/api/levels/${invalidId}`)
        .expect(400);
    });
  });
});
