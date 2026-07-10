import { z } from 'zod';

export enum StatusName {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  DELETED = 'DELETED',
}

/**
 * IDs de Status según DATABASE.md
 * Tabla compartida para borrado lógico en Level y Project.
 */
export const STATUS_ID = {
  PENDING: 1,
  ACTIVE: 2,
  EXPIRED: 3,
  DELETED: 4,
} as const;

export type StatusId = (typeof STATUS_ID)[keyof typeof STATUS_ID];

export const StatusSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

export type StatusDto = z.infer<typeof StatusSchema>;

// Response usa el mismo schema (consistencia con Level)
export const StatusResponseSchema = StatusSchema;

export type StatusResponseDto = z.infer<typeof StatusResponseSchema>;
