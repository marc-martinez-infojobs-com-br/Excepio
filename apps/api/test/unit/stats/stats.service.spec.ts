import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StatsService } from '@stats/stats.service';
import { PrismaService } from '@app/prisma/prisma.service';
import type { TotalStatsResponseDto } from '@excepio/shared';

describe('StatsService - getTotal', () => {
  let service: StatsService;
  let mockPrisma: {
    exception: {
      count: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(() => {
    mockPrisma = {
      exception: {
        count: vi.fn(),
      },
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
