import { z } from 'zod';

export const PlatformSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  icon: z.string().nullable().optional(),
  apiKey: z.string(),
  statusId: z.number().int(),
  createdAt: z.string().datetime(),
});

export type PlatformDto = z.infer<typeof PlatformSchema>;

export const CreatePlatformSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
  icon: z.string().max(50).optional(),
});

export type CreatePlatformDto = z.infer<typeof CreatePlatformSchema>;

export const UpdatePlatformSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  icon: z.string().max(50).nullable().optional(),
  statusId: z.number().int().optional(),
});

export type UpdatePlatformDto = z.infer<typeof UpdatePlatformSchema>;
