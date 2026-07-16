import { z } from 'zod';

/**
 * Enum de roles de usuario
 * Sincronizado con Prisma enum UserRole
 */
export enum UserRole {
  ADMINISTRADOR = 'ADMINISTRADOR',
  USUARIO = 'USUARIO',
}

/**
 * Schema para crear un usuario
 */
export const CreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().min(1, 'El nombre es requerido'),
  role: z.nativeEnum(UserRole).optional(),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

/**
 * Schema para actualizar un usuario
 * Todos los campos son opcionales excepto el ID (que va en la URL)
 */
export const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.nativeEnum(UserRole).optional(),
  statusId: z.number().int().optional(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

/**
 * Schema para cambiar contraseña
 */
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
});

export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;

/**
 * Schema para resetear contraseña (admin)
 * No requiere contraseña actual ya que lo hace un administrador
 */
export const ResetPasswordSchema = z.object({
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Debes confirmar la contraseña'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;

/**
 * Schema de respuesta de usuario
 * NO incluye el password por seguridad
 */
export const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.nativeEnum(UserRole),
  statusId: z.number().int(),
  lastLoginAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type UserResponseDto = z.infer<typeof UserResponseSchema>;
