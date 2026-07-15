import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { createPrismaClient } from '../helpers/prisma';

describe('Database Seed', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = createPrismaClient();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Status', () => {
    it('should have 4 status records', async () => {
      const statuses = await prisma.status.findMany();
      expect(statuses).toHaveLength(4);
    });

    it('should have correct status values', async () => {
      const statuses = await prisma.status.findMany({ orderBy: { id: 'asc' } });
      expect(statuses.map((s) => s.name)).toEqual([
        'PENDING',
        'ACTIVE',
        'EXPIRED',
        'DELETED',
      ]);
    });

    it('should have correct status IDs', async () => {
      const statuses = await prisma.status.findMany({ orderBy: { id: 'asc' } });
      expect(statuses.map((s) => ({ id: s.id, name: s.name }))).toEqual([
        { id: 1, name: 'PENDING' },
        { id: 2, name: 'ACTIVE' },
        { id: 3, name: 'EXPIRED' },
        { id: 4, name: 'DELETED' },
      ]);
    });
  });

  describe('Level', () => {
    it('should have 5 level records', async () => {
      const levels = await prisma.level.findMany();
      expect(levels).toHaveLength(5);
    });

    it('should have correct level values with order', async () => {
      const levels = await prisma.level.findMany({ orderBy: { order: 'asc' } });
      expect(levels.map((l) => ({ name: l.name, order: l.order }))).toEqual([
        { name: 'DEBUG', order: 1 },
        { name: 'INFO', order: 2 },
        { name: 'WARNING', order: 3 },
        { name: 'ERROR', order: 4 },
        { name: 'FATAL', order: 5 },
      ]);
    });

    it('should have all levels with ACTIVE status', async () => {
      const levels = await prisma.level.findMany({ include: { status: true } });
      expect(levels.every((l) => l.status.name === 'ACTIVE')).toBe(true);
    });
  });

  describe('Platform', () => {
    it('should have 5 platform records', async () => {
      const platforms = await prisma.platform.findMany();
      expect(platforms).toHaveLength(5);
    });

    it('should have correct platform names', async () => {
      const platforms = await prisma.platform.findMany({
        orderBy: { name: 'asc' },
      });
      const platformNames = platforms.map((p) => p.name).sort();
      expect(platformNames).toEqual(['API', 'Android', 'WM', 'Web', 'iOS'].sort());
    });

    it('should have all platforms with ACTIVE status', async () => {
      const platforms = await prisma.platform.findMany({
        include: { status: true },
      });
      expect(platforms.every((p) => p.status.name === 'ACTIVE')).toBe(true);
    });

    it('should have unique apiKey for each platform', async () => {
      const platforms = await prisma.platform.findMany();
      const apiKeys = platforms.map((p) => p.apiKey);
      const uniqueApiKeys = new Set(apiKeys);
      expect(uniqueApiKeys.size).toBe(apiKeys.length);
    });

    it('should have apiKey with 64 characters (hex)', async () => {
      const platforms = await prisma.platform.findMany();
      expect(platforms.every((p) => p.apiKey.length === 64)).toBe(true);
    });
  });
});
