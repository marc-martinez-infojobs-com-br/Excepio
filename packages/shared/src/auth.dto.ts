import { z } from 'zod';
import { UserResponseSchema, UserRole } from './user.dto';

/**
 * Validación de contraseña segura
 * Requisitos:
 * - Mínimo 8 caracteres
 * - Al menos 1 mayúscula
 * - Al menos 1 minúscula
 * - Al menos 1 número
 * - Al menos 1 carácter especial
 */
const passwordSchema = z
  .string()
  .min(8, 'La contraseña no cumple los requisitos de seguridad')
  .regex(/[A-Z]/, 'La contraseña no cumple los requisitos de seguridad')
  .regex(/[a-z]/, 'La contraseña no cumple los requisitos de seguridad')
  .regex(/[0-9]/, 'La contraseña no cumple los requisitos de seguridad')
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    'La contraseña no cumple los requisitos de seguridad'
  );

/**
 * Schema base para registro de usuario (sin validación de refine)
 * Usar este schema con react-hook-form ya que @hookform/resolvers 
 * tiene problemas con .refine() en Zod v4
 */
export const RegisterBaseSchema = z.object({
  email: z.string().email('Email inválido'),
  password: passwordSchema,
  confirmPassword: z.string(),
  name: z.string().min(1, 'El nombre es requerido'),
});

/**
 * Schema completo para registro de usuario (con validación de contraseñas)
 * Usar para validación completa en el backend o validación manual
 */
export const RegisterSchema = RegisterBaseSchema.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  }
);

export type RegisterDto = z.infer<typeof RegisterSchema>;

/**
 * Schema para registro en el backend (sin confirmPassword)
 * El frontend valida que las contraseñas coincidan antes de enviar
 */
export const RegisterBackendSchema = z.object({
  email: z.string().email('Email inválido'),
  password: passwordSchema,
  name: z.string().min(1, 'El nombre es requerido'),
});

export type RegisterBackendDto = z.infer<typeof RegisterBackendSchema>;

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
  iat?: number; // issued at (timestamp)
  exp?: number; // expiration (timestamp)
}
