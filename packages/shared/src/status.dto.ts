import { z } from 'zod';

export enum StatusName {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  DELETED = 'DELETED',
}

export const StatusSchema = z.object({
  id: z.number().int(),
  name: z.string(),
});

export type StatusDto = z.infer<typeof StatusSchema>;
