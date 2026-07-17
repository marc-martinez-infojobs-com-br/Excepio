import { z } from 'zod';

export const ExceptionSchema = z.object({
  id: z.string().uuid(),
  platformId: z.number().int(),
  levelId: z.number().int(),
  message: z.string(),
  stackTrace: z.string().nullable().optional(),
  userId: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  appVersion: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  createdAt: z.string().datetime(),
});

export type ExceptionDto = z.infer<typeof ExceptionSchema>;

// DTO para una ocurrencia en el historial
export const OccurrenceSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  userId: z.string().nullable().optional(),
  platformName: z.string(),
  platformIcon: z.string().nullable().optional(),
  appVersion: z.string().nullable().optional(),
  url: z.string().nullable().optional(),
});

export type OccurrenceDto = z.infer<typeof OccurrenceSchema>;

// DTO para agrupación por día
export const OccurrenceByDaySchema = z.object({
  date: z.string(), // "2024-01-15"
  count: z.number().int().min(0),
});

export type OccurrenceByDayDto = z.infer<typeof OccurrenceByDaySchema>;

export const ExceptionDetailSchema = ExceptionSchema.extend({
  affectedUsersCount: z.number().int().min(0),
  levelName: z.string().optional(),
  platformName: z.string().optional(),
  platformIcon: z.string().nullable().optional(),
  // Historial de ocurrencias
  occurrences: z.array(OccurrenceSchema).optional(),
  occurrencesByDay: z.array(OccurrenceByDaySchema).optional(),
  totalOccurrences: z.number().int().min(0).optional(),
});

export type ExceptionDetailDto = z.infer<typeof ExceptionDetailSchema>;

export const CreateExceptionSchema = z.object({
  levelId: z.number().int().min(1).max(5),
  message: z.string().min(1),
  stackTrace: z.string().optional(),
  userId: z.string().optional(),
  url: z.string().optional(),
  userAgent: z.string().optional(),
  appVersion: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateExceptionDto = z.infer<typeof CreateExceptionSchema>;

export const ExceptionFilterSchema = z.object({
  // Filtros exactos
  platformId: z.number().int().optional(),
  levelId: z.number().int().optional(),
  userId: z.string().optional(),
  
  // Rango de fechas
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  
  // Búsqueda por campo específico (ILIKE %valor%)
  messageSearch: z.string().optional(),
  stackTraceSearch: z.string().optional(),
  urlSearch: z.string().optional(),
  userAgentSearch: z.string().optional(),
  appVersionSearch: z.string().optional(),
  metadataSearch: z.string().optional(),
  
  // Paginación
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type ExceptionFilterDto = z.infer<typeof ExceptionFilterSchema>;

export const ExceptionListResponseSchema = z.object({
  data: z.array(ExceptionSchema),
  total: z.number().int(),
  page: z.number().int(),
  limit: z.number().int(),
});

export type ExceptionListResponseDto = z.infer<typeof ExceptionListResponseSchema>;
