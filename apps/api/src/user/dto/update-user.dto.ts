import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsInt } from 'class-validator';
import { UserRole } from '@excepio/shared';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Email del usuario',
    example: 'nuevoemail@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Contraseña (mínimo 8 caracteres)',
    example: 'NewPassword123!',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password?: string;

  @ApiPropertyOptional({
    description: 'Nombre completo del usuario',
    example: 'Juan Carlos Pérez',
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'El nombre es requerido' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Rol del usuario',
    enum: UserRole,
    example: UserRole.ADMINISTRADOR,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Rol inválido' })
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'ID del estado del usuario (1=PENDING, 2=ACTIVE, 3=EXPIRED, 4=DELETED)',
    example: 2,
    minimum: 1,
    maximum: 4,
  })
  @IsOptional()
  @IsInt({ message: 'statusId debe ser un número entero' })
  statusId?: number;
}
