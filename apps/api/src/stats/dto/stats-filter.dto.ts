import {
  IsOptional,
  IsDateString,
  IsInt,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StatsFilterDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio (ISO 8601)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin (ISO 8601)',
    example: '2024-01-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'ID de la plataforma', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  platformId?: number;
}

export class TimeStatsFilterDto extends StatsFilterDto {
  @ApiPropertyOptional({ description: 'ID del nivel de severidad', example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  levelId?: number;

  @ApiPropertyOptional({
    description: 'Granularidad temporal',
    enum: ['hour', 'day'],
    example: 'day',
  })
  @IsOptional()
  @IsEnum(['hour', 'day'])
  granularity?: 'hour' | 'day';
}

export class GroupedExceptionsFilterDto extends StatsFilterDto {
  @ApiPropertyOptional({ description: 'ID del nivel de severidad', example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  levelId?: number;

  @ApiPropertyOptional({ description: 'Página', example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Límite de resultados por página',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
