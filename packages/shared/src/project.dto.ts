import { z } from 'zod';

export const ProjectSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  apiKey: z.string(),
  statusId: z.number().int(),
  createdAt: z.string().datetime(),
});

export type ProjectDto = z.infer<typeof ProjectSchema>;

export const CreateProjectSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1).max(100),
});

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  statusId: z.number().int().optional(),
});

export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;
