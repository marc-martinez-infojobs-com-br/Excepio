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

  describe('Project', () => {
    it('should have 5 project records', async () => {
      const projects = await prisma.project.findMany();
      expect(projects).toHaveLength(5);
    });

    it('should have correct project names', async () => {
      const projects = await prisma.project.findMany({
        orderBy: { name: 'asc' },
      });
      const projectNames = projects.map((p) => p.name).sort();
      expect(projectNames).toEqual(['API', 'Android', 'WM', 'Web', 'iOS'].sort());
    });

    it('should have all projects with ACTIVE status', async () => {
      const projects = await prisma.project.findMany({
        include: { status: true },
      });
      expect(projects.every((p) => p.status.name === 'ACTIVE')).toBe(true);
    });

    it('should have unique apiKey for each project', async () => {
      const projects = await prisma.project.findMany();
      const apiKeys = projects.map((p) => p.apiKey);
      const uniqueApiKeys = new Set(apiKeys);
      expect(uniqueApiKeys.size).toBe(apiKeys.length);
    });

    it('should have apiKey with 64 characters (hex)', async () => {
      const projects = await prisma.project.findMany();
      expect(projects.every((p) => p.apiKey.length === 64)).toBe(true);
    });
  });
});
