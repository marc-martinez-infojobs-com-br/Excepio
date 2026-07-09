import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import dotenv from 'dotenv';
import { PrismaService } from '../../src/prisma/prisma.service';

// Cargar variables de entorno antes de los tests
beforeAll(() => {
  dotenv.config();
});

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
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

  it('should have project model', () => {
    expect(service.project).toBeDefined();
  });

  it('should have exception model', () => {
    expect(service.exception).toBeDefined();
  });
});
