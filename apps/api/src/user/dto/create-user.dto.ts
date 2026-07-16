import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { UserRole } from '@excepio/shared';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@example.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({
    description: 'Contraseña (mínimo 8 caracteres)',
    example: 'Password123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Pérez',
  })
  @IsString()
  @MinLength(1, { message: 'El nombre es requerido' })
  name: string;

  @ApiPropertyOptional({
    description: 'Rol del usuario',
    enum: UserRole,
    example: UserRole.USUARIO,
    default: UserRole.USUARIO,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Rol inválido' })
  role?: UserRole;
}
