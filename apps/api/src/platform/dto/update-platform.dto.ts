import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsInt, IsOptional, ValidateIf } from 'class-validator';

export class UpdatePlatformDto {
  @ApiPropertyOptional({
    description: 'Nombre de la plataforma',
    example: 'Mi Aplicación Actualizada',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Nombre del icono de la plataforma (de la galería predefinida). Enviar null para eliminar.',
    example: 'Monitor',
    maxLength: 50,
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(50)
  icon?: string | null;

  @ApiPropertyOptional({
    description: 'ID del estado (1=PENDING, 2=ACTIVE, 3=EXPIRED, 4=DELETED)',
    example: 2,
    minimum: 1,
    maximum: 4,
  })
  @IsOptional()
  @IsInt()
  statusId?: number;
}
