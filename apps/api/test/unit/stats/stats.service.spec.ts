import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StatsService } from '@stats/stats.service';
import { PrismaService } from '@app/prisma/prisma.service';

describe('StatsService - getTotal', () => {
  let service: StatsService;
  let mockPrisma: {
    exception: {
      count: ReturnType<typeof vi.fn>;
      groupBy: ReturnType<typeof vi.fn>;
    };
    $queryRaw: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockPrisma = {
      exception: {
        count: vi.fn(),
        groupBy: vi.fn(),
      },
      $queryRaw: vi.fn(),
    };

    service = new StatsService(mockPrisma as unknown as PrismaService);
  });

  describe('sin filtros (últimas 24h por defecto)', () => {
    it('debería retornar estructura correcta', async () => {
      mockPrisma.exception.count
        .mockResolvedValueOnce(100) // current period
        .mockResolvedValueOnce(80); // previous period

      const result = await service.getTotal({});

      expect(result).toHaveProperty('current');
      expect(result).toHaveProperty('previous');
      expect(result).toHaveProperty('changePercent');
      expect(result.current).toHaveProperty('total');
      expect(result.current).toHaveProperty('startDate');
      expect(result.current).toHaveProperty('endDate');
    });

    it('debería calcular porcentaje de cambio correctamente (aumento)', async () => {
      mockPrisma.exception.count
        .mockResolvedValueOnce(120) // current
        .mockResolvedValueOnce(100); // previous

      const result = await service.getTotal({});

      // ((120 - 100) / 100) * 100 = 20%
      expect(result.changePercent).toBe(20);
    });

    it('debería calcular porcentaje de cambio correctamente (disminución)', async () => {
      mockPrisma.exception.count
        .mockResolvedValueOnce(80) // current
        .mockResolvedValueOnce(100); // previous

      const result = await service.getTotal({});

      // ((80 - 100) / 100) * 100 = -20%
      expect(result.changePercent).toBe(-20);
    });

    it('debería retornar 0% si no hay datos en período anterior', async () => {
      mockPrisma.exception.count
        .mockResolvedValueOnce(50) // current
        .mockResolvedValueOnce(0); // previous

      const result = await service.getTotal({});

      expect(result.changePercent).toBe(0);
    });
  });

  describe('con filtros de fecha', () => {
    it('debería usar las fechas proporcionadas', async () => {
      const startDate = '2024-01-01T00:00:00.000Z';
      const endDate = '2024-01-31T23:59:59.999Z';

      mockPrisma.exception.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(40);

      const result = await service.getTotal({ startDate, endDate });

      expect(result.current.startDate).toBe(startDate);
      expect(result.current.endDate).toBe(endDate);

      // El período anterior debería tener la misma duración
      const currentDuration =
        new Date(endDate).getTime() - new Date(startDate).getTime();
      const previousDuration =
        new Date(result.previous.endDate).getTime() -
        new Date(result.previous.startDate).getTime();

      expect(currentDuration).toBe(previousDuration);
    });
  });

  describe('con filtro de plataforma', () => {
    it('debería filtrar por platformId', async () => {
      mockPrisma.exception.count
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(25);

      await service.getTotal({ platformId: 1 });

      // Verificar que se llamó con el filtro de plataforma
      expect(mockPrisma.exception.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            platformId: 1,
          }),
        }),
      );
    });
  });

  describe('redondeo de porcentaje', () => {
    it('debería redondear a 2 decimales', async () => {
      mockPrisma.exception.count
        .mockResolvedValueOnce(133) // current
        .mockResolvedValueOnce(100); // previous

      const result = await service.getTotal({});

      // ((133 - 100) / 100) * 100 = 33%
      expect(result.changePercent).toBe(33);
    });
  });
});

describe('StatsService - getByTime', () => {
  let service: StatsService;
  let mockPrisma: {
    exception: {
      count: ReturnType<typeof vi.fn>;
      groupBy: ReturnType<typeof vi.fn>;
    };
    $queryRawUnsafe: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockPrisma = {
      exception: {
        count: vi.fn(),
        groupBy: vi.fn(),
      },
      $queryRawUnsafe: vi.fn(),
    };

    service = new StatsService(mockPrisma as unknown as PrismaService);
  });

  describe('granularidad automática', () => {
    it('debería usar granularidad "hour" para rangos <= 48h', async () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(); // 24h antes
      const endDate = now.toISOString();

      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([]);

      const result = await service.getByTime({ startDate, endDate });

      expect(result.granularity).toBe('hour');
    });

    it('debería usar granularidad "day" para rangos > 48h', async () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 días antes
      const endDate = now.toISOString();

      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([]);

      const result = await service.getByTime({ startDate, endDate });

      expect(result.granularity).toBe('day');
    });

    it('debería respetar la granularidad especificada manualmente', async () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      const endDate = now.toISOString();

      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([]);

      const result = await service.getByTime({ startDate, endDate, granularity: 'day' });

      expect(result.granularity).toBe('day');
    });
  });

  describe('estructura de respuesta', () => {
    it('debería retornar estructura correcta con data y granularity', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([
        { date: new Date('2024-01-01T10:00:00Z'), levelId: 4, count: BigInt(5) },
        { date: new Date('2024-01-01T10:00:00Z'), levelId: 3, count: BigInt(3) },
        { date: new Date('2024-01-01T11:00:00Z'), levelId: 4, count: BigInt(2) },
      ]);

      const result = await service.getByTime({
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-01T23:59:59.999Z',
      });

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('granularity');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('debería agrupar por fecha y tener levels como objeto', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([
        { date: new Date('2024-01-01T10:00:00Z'), levelId: 4, count: BigInt(5) },
        { date: new Date('2024-01-01T10:00:00Z'), levelId: 3, count: BigInt(3) },
      ]);

      const result = await service.getByTime({
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-01T23:59:59.999Z',
      });

      expect(result.data.length).toBeGreaterThan(0);
      const firstPoint = result.data[0];
      expect(firstPoint).toHaveProperty('date');
      expect(firstPoint).toHaveProperty('levels');
      expect(firstPoint).toHaveProperty('total');
      expect(typeof firstPoint.levels).toBe('object');
    });

    it('debería calcular el total sumando todos los levels', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([
        { date: new Date('2024-01-01T10:00:00Z'), levelId: 4, count: BigInt(5) },
        { date: new Date('2024-01-01T10:00:00Z'), levelId: 3, count: BigInt(3) },
      ]);

      const result = await service.getByTime({
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-01T23:59:59.999Z',
      });

      const firstPoint = result.data[0];
      expect(firstPoint.total).toBe(8); // 5 + 3
    });
  });

  describe('filtros', () => {
    it('debería usar las últimas 24h si no se especifican fechas', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([]);

      const result = await service.getByTime({});

      expect(result.granularity).toBe('hour');
    });
  });
});

describe('StatsService - getByPlatform', () => {
  let service: StatsService;
  let mockPrisma: {
    exception: {
      count: ReturnType<typeof vi.fn>;
      groupBy: ReturnType<typeof vi.fn>;
    };
    platform: {
      findMany: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    mockPrisma = {
      exception: {
        count: vi.fn(),
        groupBy: vi.fn(),
      },
      platform: {
        findMany: vi.fn(),
      },
    };

    service = new StatsService(mockPrisma as unknown as PrismaService);
  });

  describe('estructura de respuesta', () => {
    it('debería retornar estructura correcta con data y total', async () => {
      mockPrisma.exception.groupBy.mockResolvedValueOnce([
        { platformId: 1, _count: { id: 50 } },
        { platformId: 2, _count: { id: 30 } },
      ]);
      mockPrisma.platform.findMany.mockResolvedValueOnce([
        { id: 1, name: 'Web App' },
        { id: 2, name: 'Mobile App' },
      ]);

      const result = await service.getByPlatform({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('debería calcular el total sumando todos los counts', async () => {
      mockPrisma.exception.groupBy.mockResolvedValueOnce([
        { platformId: 1, _count: { id: 50 } },
        { platformId: 2, _count: { id: 30 } },
        { platformId: 3, _count: { id: 20 } },
      ]);
      mockPrisma.platform.findMany.mockResolvedValueOnce([
        { id: 1, name: 'Web App' },
        { id: 2, name: 'Mobile App' },
        { id: 3, name: 'Desktop App' },
      ]);

      const result = await service.getByPlatform({});

      expect(result.total).toBe(100); // 50 + 30 + 20
    });

    it('debería incluir platformId, platformName, count y percent en cada punto', async () => {
      mockPrisma.exception.groupBy.mockResolvedValueOnce([
        { platformId: 1, _count: { id: 80 } },
        { platformId: 2, _count: { id: 20 } },
      ]);
      mockPrisma.platform.findMany.mockResolvedValueOnce([
        { id: 1, name: 'Web App' },
        { id: 2, name: 'Mobile App' },
      ]);

      const result = await service.getByPlatform({});

      expect(result.data.length).toBe(2);
      const firstPoint = result.data[0];
      expect(firstPoint).toHaveProperty('platformId');
      expect(firstPoint).toHaveProperty('platformName');
      expect(firstPoint).toHaveProperty('count');
      expect(firstPoint).toHaveProperty('percent');
    });

    it('debería calcular porcentajes correctamente', async () => {
      mockPrisma.exception.groupBy.mockResolvedValueOnce([
        { platformId: 1, _count: { id: 75 } },
        { platformId: 2, _count: { id: 25 } },
      ]);
      mockPrisma.platform.findMany.mockResolvedValueOnce([
        { id: 1, name: 'Web App' },
        { id: 2, name: 'Mobile App' },
      ]);

      const result = await service.getByPlatform({});

      const webApp = result.data.find((d) => d.platformId === 1);
      const mobileApp = result.data.find((d) => d.platformId === 2);

      expect(webApp?.percent).toBe(75);
      expect(mobileApp?.percent).toBe(25);
    });
  });

  describe('filtros de fecha', () => {
    it('debería usar las últimas 24h si no se especifican fechas', async () => {
      mockPrisma.exception.groupBy.mockResolvedValueOnce([]);
      mockPrisma.platform.findMany.mockResolvedValueOnce([]);

      await service.getByPlatform({});

      expect(mockPrisma.exception.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
    });

    it('debería usar las fechas proporcionadas', async () => {
      const startDate = '2024-01-01T00:00:00.000Z';
      const endDate = '2024-01-31T23:59:59.999Z';

      mockPrisma.exception.groupBy.mockResolvedValueOnce([]);
      mockPrisma.platform.findMany.mockResolvedValueOnce([]);

      await service.getByPlatform({ startDate, endDate });

      expect(mockPrisma.exception.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
        }),
      );
    });
  });

  describe('casos especiales', () => {
    it('debería retornar array vacío y total 0 si no hay datos', async () => {
      mockPrisma.exception.groupBy.mockResolvedValueOnce([]);
      mockPrisma.platform.findMany.mockResolvedValueOnce([]);

      const result = await service.getByPlatform({});

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('debería manejar plataformas sin nombre (usar "Unknown")', async () => {
      mockPrisma.exception.groupBy.mockResolvedValueOnce([
        { platformId: 999, _count: { id: 10 } },
      ]);
      mockPrisma.platform.findMany.mockResolvedValueOnce([]); // Plataforma no encontrada

      const result = await service.getByPlatform({});

      expect(result.data[0].platformName).toBe('Unknown');
    });
  });
});

describe('StatsService - getGroupedByMessage', () => {
  let service: StatsService;
  let mockPrisma: {
    exception: {
      count: ReturnType<typeof vi.fn>;
      groupBy: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
    };
    $queryRawUnsafe: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockPrisma = {
      exception: {
        count: vi.fn(),
        groupBy: vi.fn(),
        findMany: vi.fn(),
      },
      $queryRawUnsafe: vi.fn(),
    };

    service = new StatsService(mockPrisma as unknown as PrismaService);
  });

  describe('estructura de respuesta', () => {
    it('debería retornar estructura correcta con data, total, page y limit', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([
        {
          message: 'Error: Connection failed',
          levelId: 4,
          platformId: 1,
          count: BigInt(15),
          lastSeen: new Date('2024-01-15T10:00:00Z'),
          firstSeen: new Date('2024-01-01T08:00:00Z'),
        },
      ]);
      mockPrisma.exception.count.mockResolvedValueOnce(1);

      const result = await service.getGroupedByMessage({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('debería incluir message, levelId, platformId, count, lastSeen, firstSeen en cada item', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([
        {
          message: 'Error: Connection failed',
          levelId: 4,
          platformId: 1,
          count: BigInt(15),
          lastSeen: new Date('2024-01-15T10:00:00Z'),
          firstSeen: new Date('2024-01-01T08:00:00Z'),
        },
      ]);
      mockPrisma.exception.count.mockResolvedValueOnce(1);

      const result = await service.getGroupedByMessage({});

      expect(result.data.length).toBe(1);
      const item = result.data[0];
      expect(item).toHaveProperty('message');
      expect(item).toHaveProperty('levelId');
      expect(item).toHaveProperty('platformId');
      expect(item).toHaveProperty('count');
      expect(item).toHaveProperty('lastSeen');
      expect(item).toHaveProperty('firstSeen');
    });

    it('debería convertir BigInt count a number', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([
        {
          message: 'Error: Connection failed',
          levelId: 4,
          platformId: 1,
          count: BigInt(150),
          lastSeen: new Date('2024-01-15T10:00:00Z'),
          firstSeen: new Date('2024-01-01T08:00:00Z'),
        },
      ]);
      mockPrisma.exception.count.mockResolvedValueOnce(1);

      const result = await service.getGroupedByMessage({});

      expect(typeof result.data[0].count).toBe('number');
      expect(result.data[0].count).toBe(150);
    });
  });

  describe('paginación', () => {
    it('debería usar valores por defecto (page=1, limit=10)', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([]);
      mockPrisma.exception.count.mockResolvedValueOnce(0);

      const result = await service.getGroupedByMessage({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('debería respetar los valores de paginación proporcionados', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([]);
      mockPrisma.exception.count.mockResolvedValueOnce(0);

      const result = await service.getGroupedByMessage({ page: 2, limit: 25 });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(25);
    });

    it('debería calcular OFFSET correctamente', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([]);
      mockPrisma.exception.count.mockResolvedValueOnce(0);

      await service.getGroupedByMessage({ page: 3, limit: 10 });

      // page 3 con limit 10 = OFFSET 20
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('OFFSET 20'),
      );
    });
  });

  describe('filtros', () => {
    it('debería usar las últimas 24h si no se especifican fechas', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([]);
      mockPrisma.exception.count.mockResolvedValueOnce(0);

      await service.getGroupedByMessage({});

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('"createdAt" >='),
      );
    });

    it('debería filtrar por platformId si se proporciona', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([]);
      mockPrisma.exception.count.mockResolvedValueOnce(0);

      await service.getGroupedByMessage({ platformId: 1 });

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('"platformId" = 1'),
      );
    });

    it('debería filtrar por levelId si se proporciona', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([]);
      mockPrisma.exception.count.mockResolvedValueOnce(0);

      await service.getGroupedByMessage({ levelId: 4 });

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('"levelId" = 4'),
      );
    });
  });

  describe('ordenamiento', () => {
    it('debería ordenar por count DESC (más frecuentes primero)', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([]);
      mockPrisma.exception.count.mockResolvedValueOnce(0);

      await service.getGroupedByMessage({});

      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY count DESC'),
      );
    });
  });

  describe('casos especiales', () => {
    it('debería retornar array vacío si no hay datos', async () => {
      mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([]);
      mockPrisma.exception.count.mockResolvedValueOnce(0);

      const result = await service.getGroupedByMessage({});

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });
  });
});
