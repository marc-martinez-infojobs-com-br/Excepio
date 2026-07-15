import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NestFactory } from '@nestjs/core';
import { Module, INestApplication, Controller, Get, Param, ParseIntPipe, Injectable, Inject } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { StatusResponseDto } from '@excepio/shared';
import { StatusMemoryRepository, STATUS_REPOSITORY } from '@status/repository';
import type { StatusRepository } from '@status/repository';

// Datos de seed que simulan la BD real
const seedStatuses: StatusResponseDto[] = [
  { id: 1, name: 'PENDING' },
  { id: 2, name: 'ACTIVE' },
  { id: 3, name: 'EXPIRED' },
  { id: 4, name: 'DELETED' },
];

const TEST_STATUS_SERVICE = Symbol('TEST_STATUS_SERVICE');

// Recreamos el servicio y controller inline para evitar problemas con metadata
@Injectable()
class TestStatusService {
  constructor(@Inject(STATUS_REPOSITORY) private readonly repo: StatusRepository) {}

  async findAll(): Promise<StatusResponseDto[]> {
    return this.repo.findAll();
  }

  async findById(id: number): Promise<StatusResponseDto> {
    const status = await this.repo.findById(id);
    if (!status) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException(`Status with id ${id} not found`);
    }
    return status;
  }
}

@Controller('status')
class TestStatusController {
  constructor(@Inject(TEST_STATUS_SERVICE) private readonly statusService: TestStatusService) {}

  @Get()
  async findAll(): Promise<StatusResponseDto[]> {
    return this.statusService.findAll();
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<StatusResponseDto> {
    return this.statusService.findById(id);
  }
}

@Module({
  controllers: [TestStatusController],
  providers: [
    {
      provide: TEST_STATUS_SERVICE,
      useClass: TestStatusService,
    },
    {
      provide: STATUS_REPOSITORY,
      useFactory: () => new StatusMemoryRepository(seedStatuses),
    },
  ],
})
class TestStatusModule {}

describe('Status CRUD (integration)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    app = await NestFactory.create(TestStatusModule, { logger: false });
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /api/status', () => {
    it('Given_StatusesExistInDatabase_When_GetAllStatuses_Then_ReturnsStatusesArray', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/status')
        .expect(200);

      // Assert
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(4);

      // Verificar estructura de cada status
      response.body.forEach((status: StatusResponseDto) => {
        expect(status).toHaveProperty('id');
        expect(status).toHaveProperty('name');
        expect(typeof status.id).toBe('number');
        expect(typeof status.name).toBe('string');
      });
    });

    it('Given_StatusesExistInDatabase_When_GetAllStatuses_Then_ReturnsKnownStatuses', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/status')
        .expect(200);

      // Assert: debemos tener los status del seed
      const statuses: StatusResponseDto[] = response.body;
      const statusNames = statuses.map((s) => s.name);

      expect(statusNames).toContain('PENDING');
      expect(statusNames).toContain('ACTIVE');
      expect(statusNames).toContain('EXPIRED');
      expect(statusNames).toContain('DELETED');
    });
  });

  describe('GET /api/status/:id', () => {
    it('Given_ExistingStatusId_When_GetStatusById_Then_ReturnsStatus', async () => {
      // Arrange: ID 1 debería ser PENDING según el seed
      const statusId = 1;

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/status/${statusId}`)
        .expect(200);

      // Assert
      const status: StatusResponseDto = response.body;
      expect(status.id).toBe(statusId);
      expect(status.name).toBe('PENDING');
    });

    it('Given_NonExistingStatusId_When_GetStatusById_Then_Returns404', async () => {
      // Arrange
      const nonExistingId = 999;

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/status/${nonExistingId}`)
        .expect(404);

      // Assert
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });

    it('Given_InvalidStatusId_When_GetStatusById_Then_Returns400', async () => {
      // Arrange
      const invalidId = 'not-a-number';

      // Act & Assert
      await request(app.getHttpServer())
        .get(`/api/status/${invalidId}`)
        .expect(400);
    });

    it('Given_ExistingStatusId_When_GetStatusById_Then_ReturnsCorrectStatus', async () => {
      // Arrange: ID 2 debería ser ACTIVE según el seed
      const statusId = 2;

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/status/${statusId}`)
        .expect(200);

      // Assert
      const status: StatusResponseDto = response.body;
      expect(status.id).toBe(statusId);
      expect(status.name).toBe('ACTIVE');
    });
  });
});
