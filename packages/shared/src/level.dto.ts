import { z } from 'zod';

export enum LevelName {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

// Schema para Level
export const LevelSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  order: z.number().int(),
  statusId: z.number().int(),
});

export type LevelDto = z.infer<typeof LevelSchema>;

// Response usa el mismo schema (sin status anidado)
export const LevelResponseSchema = LevelSchema;

export type LevelResponseDto = z.infer<typeof LevelResponseSchema>;
