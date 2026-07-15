import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ExceptionFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de proyecto',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  projectId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por nivel de severidad',
    example: 4,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  levelId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por userId exacto',
    example: 'user_12345',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Fecha inicio (ISO 8601)',
    example: '2026-07-01T00:00:00Z',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha fin (ISO 8601)',
    example: '2026-07-14T23:59:59Z',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Buscar en mensaje (case-insensitive)',
    example: 'NullPointer',
  })
  @IsOptional()
  @IsString()
  messageSearch?: string;

  @ApiPropertyOptional({
    description: 'Buscar en URL (case-insensitive)',
    example: '/api/users',
  })
  @IsOptional()
  @IsString()
  urlSearch?: string;

  @ApiPropertyOptional({
    description: 'Buscar en userAgent (case-insensitive)',
    example: 'Chrome',
  })
  @IsOptional()
  @IsString()
  userAgentSearch?: string;

  @ApiPropertyOptional({
    description: 'Buscar en appVersion (case-insensitive)',
    example: '1.2',
  })
  @IsOptional()
  @IsString()
  appVersionSearch?: string;

  @ApiPropertyOptional({
    description: 'Buscar en stackTrace (case-insensitive)',
    example: 'NullPointerException',
  })
  @IsOptional()
  @IsString()
  stackTraceSearch?: string;

  @ApiPropertyOptional({
    description: 'Buscar en metadata JSON (case-insensitive)',
    example: 'getData',
  })
  @IsOptional()
  @IsString()
  metadataSearch?: string;

  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Límite de resultados por página',
    example: 50,
    minimum: 1,
    maximum: 100,
    default: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
