import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsInt, IsOptional } from 'class-validator';

export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: 'Nombre del proyecto',
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
    description: 'ID del estado (1=PENDING, 2=ACTIVE, 3=EXPIRED, 4=DELETED)',
    example: 2,
    minimum: 1,
    maximum: 4,
  })
  @IsOptional()
  @IsInt()
  statusId?: number;
}
