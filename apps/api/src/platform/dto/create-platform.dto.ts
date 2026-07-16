import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsInt, Min, IsOptional } from 'class-validator';

export class CreatePlatformDto {
  @ApiProperty({
    description: 'Identificador numérico único de la plataforma',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  id: number;

  @ApiProperty({
    description: 'Nombre de la plataforma',
    example: 'Mi Aplicación Web',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({
    description: 'Nombre del icono de la plataforma (de la galería predefinida)',
    example: 'Monitor',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;
}
