import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { ConfigService } from '@nestjs/config';
import dotenv from 'dotenv';
import { PrismaService } from '../../src/prisma/prisma.service';

// Cargar variables de entorno antes de que se ejecute cualquier test
dotenv.config();

describe('PrismaService', () => {
  let service: PrismaService;

  const mockConfigService = {
    get: (key: string) => {
      if (key === 'DATABASE_URL') {
        return process.env.DATABASE_URL;
      }
      return undefined;
    },
  } as ConfigService;

  beforeEach(() => {
    service = new PrismaService(mockConfigService);
  });

  afterEach(async () => {
    if (service) {
      await service.$disconnect();
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have status model', () => {
    expect(service.status).toBeDefined();
  });

  it('should have level model', () => {
    expect(service.level).toBeDefined();
  });

  it('should have platform model', () => {
    expect(service.platform).toBeDefined();
  });

  it('should have exception model', () => {
    expect(service.exception).toBeDefined();
  });
});
