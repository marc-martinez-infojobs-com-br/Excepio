import { z } from 'zod';
import { UserResponseSchema, UserRole } from './user.dto';

/**
 * Schema para registro de usuario
 */
export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().min(1, 'El nombre es requerido'),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

/**
 * Schema para login
 */
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginDto = z.infer<typeof LoginSchema>;

/**
 * Schema de respuesta de login
 * Incluye el token JWT y los datos del usuario (sin password)
 */
export const LoginResponseSchema = z.object({
  access_token: z.string(),
  user: UserResponseSchema,
});

export type LoginResponseDto = z.infer<typeof LoginResponseSchema>;

/**
 * Payload del JWT (lo que va dentro del token)
 */
export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: UserRole;
}
