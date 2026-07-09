import { z } from 'zod';

export enum LevelName {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  FATAL = 'FATAL',
}

export const LevelSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  order: z.number().int(),
  statusId: z.number().int(),
});

export type LevelDto = z.infer<typeof LevelSchema>;
