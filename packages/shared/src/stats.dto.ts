import { z } from 'zod';

// ============================================
// Filtros base para estadísticas
// ============================================

export const StatsFilterSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  platformId: z.coerce.number().int().optional(),
});

export type StatsFilterDto = z.infer<typeof StatsFilterSchema>;

// ============================================
// Total de excepciones con comparación
// ============================================

export const PeriodStatsSchema = z.object({
  total: z.number().int(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  byLevel: z.record(z.string(), z.number().int()).optional(),
});

export type PeriodStatsDto = z.infer<typeof PeriodStatsSchema>;

export const TotalStatsResponseSchema = z.object({
  current: PeriodStatsSchema,
  previous: PeriodStatsSchema,
  changePercent: z.number(),
});

export type TotalStatsResponseDto = z.infer<typeof TotalStatsResponseSchema>;

// ============================================
// Serie temporal por level
// ============================================

export const TimeStatsFilterSchema = StatsFilterSchema.extend({
  levelId: z.coerce.number().int().optional(),
  granularity: z.enum(['hour', 'day', 'week', 'month']).optional(),
});

export type TimeStatsFilterDto = z.infer<typeof TimeStatsFilterSchema>;

export const TimeDataPointSchema = z.object({
  date: z.string().datetime(),
  levels: z.record(z.string(), z.number().int()),
  total: z.number().int(),
});

export type TimeDataPointDto = z.infer<typeof TimeDataPointSchema>;

export const TimeStatsResponseSchema = z.object({
  data: z.array(TimeDataPointSchema),
  granularity: z.enum(['hour', 'day', 'week', 'month']),
});

export type TimeStatsResponseDto = z.infer<typeof TimeStatsResponseSchema>;

// ============================================
// Distribución por plataforma
// ============================================

export const PlatformDataPointSchema = z.object({
  platformId: z.number().int(),
  platformName: z.string(),
  count: z.number().int(),
  percent: z.number(),
});

export type PlatformDataPointDto = z.infer<typeof PlatformDataPointSchema>;

export const PlatformStatsResponseSchema = z.object({
  data: z.array(PlatformDataPointSchema),
  total: z.number().int(),
});

export type PlatformStatsResponseDto = z.infer<typeof PlatformStatsResponseSchema>;

// ============================================
// Excepciones agrupadas por mensaje
// ============================================

export const GroupedExceptionsFilterSchema = StatsFilterSchema.extend({
  levelId: z.coerce.number().int().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export type GroupedExceptionsFilterDto = z.infer<typeof GroupedExceptionsFilterSchema>;

export const GroupedExceptionSchema = z.object({
  message: z.string(),
  levelId: z.number().int(),
  platformId: z.number().int(),
  count: z.number().int(),
  lastSeen: z.string().datetime(),
  firstSeen: z.string().datetime(),
});

export type GroupedExceptionDto = z.infer<typeof GroupedExceptionSchema>;

export const GroupedExceptionsResponseSchema = z.object({
  data: z.array(GroupedExceptionSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

export type GroupedExceptionsResponseDto = z.infer<typeof GroupedExceptionsResponseSchema>;
