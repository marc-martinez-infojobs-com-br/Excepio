import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@excepio/shared';

/**
 * Decorador para especificar los roles requeridos en un endpoint.
 *
 * Uso:
 * @Roles(UserRole.ADMINISTRADOR)
 * @Roles(UserRole.ADMINISTRADOR, UserRole.USUARIO)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
