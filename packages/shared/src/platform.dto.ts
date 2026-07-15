import { z } from 'zod';

export const PlatformSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  apiKey: z.string(),
  statusId: z.number().int(),
  createdAt: z.string().datetime(),
});

export type PlatformDto = z.infer<typeof PlatformSchema>;

export const CreatePlatformSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
});

export type CreatePlatformDto = z.infer<typeof CreatePlatformSchema>;

export const UpdatePlatformSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  statusId: z.number().int().optional(),
});

export type UpdatePlatformDto = z.infer<typeof UpdatePlatformSchema>;
