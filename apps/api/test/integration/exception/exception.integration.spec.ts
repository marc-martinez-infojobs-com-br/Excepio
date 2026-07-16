import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { NestFactory } from '@nestjs/core';
import {
  Module,
  INestApplication,
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  Injectable,
  Inject,
  UseGuards,
} from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import {
  ExceptionDto,
  CreateExceptionDto,
  ExceptionFilterDto,
  PlatformDto,
} from '@excepio/shared';
import {
  ExceptionMemoryRepository,
  EXCEPTION_REPOSITORY,
} from '@exception/repository';
import {
  PlatformMemoryRepository,
  PLATFORM_REPOSITORY,
} from '@platform/repository';
import type { ExceptionRepository } from '@exception/repository';
import type { PlatformRepository } from '@platform/repository';

const TEST_EXCEPTION_SERVICE = Symbol('TEST_EXCEPTION_SERVICE');

// Service inline para tests
@Injectable()
class TestExceptionService {
  constructor(
    @Inject(EXCEPTION_REPOSITORY)
    private readonly exceptionRepo: ExceptionRepository,
    @Inject(PLATFORM_REPOSITORY)
    private readonly projectRepo: PlatformRepository,
  ) {}

  async create(
    platformId: number,
    data: CreateExceptionDto,
  ): Promise<ExceptionDto> {
    let levelId = data.levelId;
    if (levelId < 1 || levelId > 5) {
      levelId = 2; // INFO por defecto
    }

    const normalizedData: CreateExceptionDto = { ...data, levelId };
    return this.exceptionRepo.create(platformId, normalizedData);
  }

  async findById(id: string): Promise<ExceptionDto> {
    const exception = await this.exceptionRepo.findById(id);
    if (!exception) {
      const { NotFoundException } = await import('@nestjs/common');
      throw new NotFoundException(`Exception with id ${id} not found`);
    }
    return exception;
  }

  async findAll(filters: ExceptionFilterDto): Promise<any> {
    const normalizedFilters: ExceptionFilterDto = {
      ...filters,
      page: filters.page || 1,
      limit: filters.limit || 50,
    };
    return this.exceptionRepo.findAll(normalizedFilters);
  }
}

// Mock guards para tests
@Injectable()
class MockApiKeyAuthGuard {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly projectRepo: PlatformRepository,
  ) {}

  async canActivate(context: any): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      const { UnauthorizedException } = await import('@nestjs/common');
      throw new UnauthorizedException('API Key is required');
    }

    const project = await this.projectRepo.findByApiKey(apiKey);

    if (!project) {
      const { UnauthorizedException } = await import('@nestjs/common');
      throw new UnauthorizedException('Invalid API Key');
    }

    request.platform = project;
    return true;
  }
}

@Injectable()
class MockJwtAuthGuard {
  canActivate(): boolean {
    return true; // Siempre permite acceso en tests
  }
}

// Decorador CurrentProject mock
const CurrentProject = () => {
  return (target: any, propertyKey: string, parameterIndex: number) => {
    // En test, simplemente inyectamos un proyecto mock
  };
};

@Controller('exceptions')
class TestExceptionController {
  constructor(
    @Inject(TEST_EXCEPTION_SERVICE)
    private readonly service: TestExceptionService,
    @Inject(PLATFORM_REPOSITORY)
    private readonly projectRepo: PlatformRepository,
  ) {}

  @Post()
  @UseGuards(MockApiKeyAuthGuard)
  async create(
    @Body() dto: CreateExceptionDto,
    @Inject('REQUEST') req?: any,
  ): Promise<ExceptionDto> {
    // Simular extracción del proyecto del request
    const apiKey = req?.headers?.['x-api-key'];
    const project = apiKey ? await this.projectRepo.findByApiKey(apiKey) : null;
    const platformId = project?.id || 1;
    return this.service.create(platformId, dto);
  }

  @Get()
  @UseGuards(MockJwtAuthGuard)
  async findAll(@Query() filters: any): Promise<any> {
    // Convertir query params a números
    const normalizedFilters: ExceptionFilterDto = {
      ...filters,
      platformId: filters.platformId ? Number(filters.platformId) : undefined,
      levelId: filters.levelId ? Number(filters.levelId) : undefined,
      page: filters.page ? Number(filters.page) : undefined,
      limit: filters.limit ? Number(filters.limit) : undefined,
    };
    return this.service.findAll(normalizedFilters);
  }

  @Get(':id')
  @UseGuards(MockJwtAuthGuard)
  async findById(@Param('id') id: string): Promise<ExceptionDto> {
    return this.service.findById(id);
  }
}

// Instancias compartidas para seed/clear
let sharedExceptionRepository: ExceptionMemoryRepository;
let sharedPlatformRepository: PlatformMemoryRepository;

@Module({
  controllers: [TestExceptionController],
  providers: [
    {
      provide: TEST_EXCEPTION_SERVICE,
      useClass: TestExceptionService,
    },
    {
      provide: EXCEPTION_REPOSITORY,
      useFactory: () => {
        sharedExceptionRepository = new ExceptionMemoryRepository();
        return sharedExceptionRepository;
      },
    },
    {
      provide: PLATFORM_REPOSITORY,
      useFactory: () => {
        sharedPlatformRepository = new PlatformMemoryRepository();
        return sharedPlatformRepository;
      },
    },
    MockApiKeyAuthGuard,
    MockJwtAuthGuard,
  ],
})
class TestExceptionModule {}

describe('Exception CRUD (integration)', () => {
  let app: INestApplication<App>;

  const validApiKey = 'exc_abc123def456';
  const mockPlatform: PlatformDto = {
    id: 1,
    name: 'Test Platform',
    apiKey: validApiKey,
    statusId: 2,
    createdAt: new Date().toISOString(),
  };

  beforeAll(async () => {
    app = await NestFactory.create(TestExceptionModule, { logger: false });
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  beforeEach(() => {
    sharedExceptionRepository.clear();
    sharedPlatformRepository.clear();
    sharedPlatformRepository.seed([mockPlatform]);
  });

  describe('POST /api/exceptions (API Key authentication)', () => {
    it('Given_ValidApiKeyAndData_When_CreateException_Then_ReturnsCreatedException', async () => {
      // Arrange
      const createDto: CreateExceptionDto = {
        levelId: 4,
        message: 'Test error message',
        stackTrace: 'at test (test.js:1:1)',
        userId: 'user_123',
        url: '/test',
        userAgent: 'Test Agent',
        appVersion: '1.0.0',
        metadata: { test: true },
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/exceptions')
        .set('X-API-Key', validApiKey)
        .send(createDto)
        .expect(201);

      // Assert
      const exception: ExceptionDto = response.body;
      expect(exception.id).toBeDefined();
      expect(exception.platformId).toBe(1);
      expect(exception.levelId).toBe(4);
      expect(exception.message).toBe(createDto.message);
      expect(exception.stackTrace).toBe(createDto.stackTrace);
      expect(exception.userId).toBe(createDto.userId);
      expect(exception.url).toBe(createDto.url);
      expect(exception.userAgent).toBe(createDto.userAgent);
      expect(exception.appVersion).toBe(createDto.appVersion);
      expect(exception.metadata).toEqual(createDto.metadata);
      expect(exception.createdAt).toBeDefined();
    });

    it('Given_NoApiKey_When_CreateException_Then_Returns401', async () => {
      // Arrange
      const createDto: CreateExceptionDto = {
        levelId: 4,
        message: 'Test error',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/exceptions')
        .send(createDto)
        .expect(401);
    });

    it('Given_InvalidApiKey_When_CreateException_Then_Returns401', async () => {
      // Arrange
      const createDto: CreateExceptionDto = {
        levelId: 4,
        message: 'Test error',
      };

      // Act & Assert
      await request(app.getHttpServer())
        .post('/api/exceptions')
        .set('X-API-Key', 'invalid_key')
        .send(createDto)
        .expect(401);
    });

    it('Given_InvalidLevelId_When_CreateException_Then_UsesLevel2Default', async () => {
      // Arrange
      const createDto: CreateExceptionDto = {
        levelId: 10, // Inválido
        message: 'Test error',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/exceptions')
        .set('X-API-Key', validApiKey)
        .send(createDto)
        .expect(201);

      // Assert
      expect(response.body.levelId).toBe(2); // INFO por defecto
    });

    it('Given_MinimalData_When_CreateException_Then_CreatesWithNullOptionals', async () => {
      // Arrange
      const createDto: CreateExceptionDto = {
        levelId: 3,
        message: 'Minimal error',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/exceptions')
        .set('X-API-Key', validApiKey)
        .send(createDto)
        .expect(201);

      // Assert
      const exception: ExceptionDto = response.body;
      expect(exception.message).toBe('Minimal error');
      expect(exception.stackTrace).toBeNull();
      expect(exception.userId).toBeNull();
      expect(exception.url).toBeNull();
      expect(exception.userAgent).toBeNull();
      expect(exception.appVersion).toBeNull();
      expect(exception.metadata).toBeNull();
    });
  });

  describe('GET /api/exceptions (JWT authentication)', () => {
    beforeEach(() => {
      // Seed con excepciones de prueba
      const exception1: ExceptionDto = {
        id: '111e4567-e89b-12d3-a456-426614174111',
        platformId: 1,
        levelId: 4,
        message: 'Error 1',
        stackTrace: null,
        userId: 'user_1',
        url: '/api/test1',
        userAgent: 'Chrome',
        appVersion: '1.0.0',
        metadata: { action: 'getData' },
        createdAt: new Date('2026-07-14T10:00:00Z').toISOString(),
      };

      const exception2: ExceptionDto = {
        id: '222e4567-e89b-12d3-a456-426614174222',
        platformId: 2,
        levelId: 3,
        message: 'Warning 2',
        stackTrace: null,
        userId: 'user_2',
        url: '/api/test2',
        userAgent: 'Firefox',
        appVersion: '2.0.0',
        metadata: null,
        createdAt: new Date('2026-07-14T11:00:00Z').toISOString(),
      };

      const exception3: ExceptionDto = {
        id: '333e4567-e89b-12d3-a456-426614174333',
        platformId: 1,
        levelId: 5,
        message: 'Fatal error 3',
        stackTrace: 'at fatal (app.js:1:1)',
        userId: 'user_1',
        url: '/api/test3',
        userAgent: 'Chrome',
        appVersion: '1.0.0',
        metadata: null,
        createdAt: new Date('2026-07-14T12:00:00Z').toISOString(),
      };

      sharedExceptionRepository.seed([exception1, exception2, exception3]);
    });

    it('Given_NoFilters_When_GetExceptions_Then_ReturnsAllExceptionsPaginated', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/exceptions')
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(3);
      expect(response.body.total).toBe(3);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(50);
    });

    it('Given_ProjectIdFilter_When_GetExceptions_Then_ReturnsFilteredExceptions', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/exceptions')
        .query({ platformId: 1 })
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((e: any) => e.platformId === 1)).toBe(
        true,
      );
    });

    it('Given_LevelIdFilter_When_GetExceptions_Then_ReturnsFilteredExceptions', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/exceptions')
        .query({ levelId: 4 })
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].levelId).toBe(4);
    });

    it('Given_UserIdFilter_When_GetExceptions_Then_ReturnsExactMatch', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/exceptions')
        .query({ userId: 'user_1' })
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((e: any) => e.userId === 'user_1')).toBe(
        true,
      );
    });

    it('Given_MessageSearch_When_GetExceptions_Then_ReturnsMatchingExceptions', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/exceptions')
        .query({ messageSearch: 'error' })
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(2);
      expect(
        response.body.data.every((e: any) =>
          e.message.toLowerCase().includes('error'),
        ),
      ).toBe(true);
    });

    it('Given_UrlSearch_When_GetExceptions_Then_ReturnsMatchingExceptions', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/exceptions')
        .query({ urlSearch: 'test1' })
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].url).toContain('test1');
    });

    it('Given_UserAgentSearch_When_GetExceptions_Then_ReturnsMatchingExceptions', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/exceptions')
        .query({ userAgentSearch: 'Chrome' })
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(2);
      expect(
        response.body.data.every((e: any) => e.userAgent?.includes('Chrome')),
      ).toBe(true);
    });

    it('Given_AppVersionSearch_When_GetExceptions_Then_ReturnsMatchingExceptions', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/exceptions')
        .query({ appVersionSearch: '2.0' })
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].appVersion).toBe('2.0.0');
    });

    it('Given_MetadataSearch_When_GetExceptions_Then_ReturnsMatchingExceptions', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/exceptions')
        .query({ metadataSearch: 'getData' })
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].metadata).toHaveProperty(
        'action',
        'getData',
      );
    });

    it('Given_DateRange_When_GetExceptions_Then_ReturnsFilteredExceptions', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/exceptions')
        .query({
          startDate: '2026-07-14T10:30:00Z',
          endDate: '2026-07-14T11:30:00Z',
        })
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(
        '222e4567-e89b-12d3-a456-426614174222',
      );
    });

    it('Given_PaginationParams_When_GetExceptions_Then_ReturnsPaginatedResults', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/exceptions')
        .query({ page: 1, limit: 2 })
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(2);
      expect(response.body.total).toBe(3);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(2);
    });

    it('Given_SecondPage_When_GetExceptions_Then_ReturnsSecondPageResults', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/exceptions')
        .query({ page: 2, limit: 2 })
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(1);
      expect(response.body.total).toBe(3);
      expect(response.body.page).toBe(2);
      expect(response.body.limit).toBe(2);
    });

    it('Given_OrderByCreatedAt_When_GetExceptions_Then_ReturnsDescendingOrder', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/exceptions')
        .expect(200);

      // Assert
      // Más reciente primero
      expect(response.body.data[0].id).toBe(
        '333e4567-e89b-12d3-a456-426614174333',
      );
      expect(response.body.data[1].id).toBe(
        '222e4567-e89b-12d3-a456-426614174222',
      );
      expect(response.body.data[2].id).toBe(
        '111e4567-e89b-12d3-a456-426614174111',
      );
    });

    it('Given_MultipleFilters_When_GetExceptions_Then_ReturnsFilteredResults', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/exceptions')
        .query({
          platformId: 1,
          userId: 'user_1',
          levelId: 5, // Solo Fatal (exception3)
        })
        .expect(200);

      // Assert
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].message).toContain('Fatal');
    });
  });

  describe('GET /api/exceptions/:id (JWT authentication)', () => {
    it('Given_ExistingId_When_GetExceptionById_Then_ReturnsException', async () => {
      // Arrange
      const exception: ExceptionDto = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        platformId: 1,
        levelId: 4,
        message: 'Test error',
        stackTrace: null,
        userId: 'user_123',
        url: '/test',
        userAgent: 'Test',
        appVersion: '1.0.0',
        metadata: null,
        createdAt: new Date().toISOString(),
      };
      sharedExceptionRepository.seed([exception]);

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/exceptions/123e4567-e89b-12d3-a456-426614174000')
        .expect(200);

      // Assert
      expect(response.body.id).toBe(exception.id);
      expect(response.body.message).toBe(exception.message);
    });

    it('Given_NonExistingId_When_GetExceptionById_Then_Returns404', async () => {
      // Act & Assert
      await request(app.getHttpServer())
        .get('/api/exceptions/999e4567-e89b-12d3-a456-426614174999')
        .expect(404);
    });
  });
});
