import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserRole } from '@excepio/shared';
import type {
  TotalStatsResponseDto,
  TimeStatsResponseDto,
  PlatformStatsResponseDto,
  GroupedExceptionsResponseDto,
} from '@excepio/shared';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { RolesGuard } from '@auth/guards/roles.guard';
import { Roles } from '@auth/decorators/roles.decorator';
import {
  StatsFilterDto,
  TimeStatsFilterDto,
  GroupedExceptionsFilterDto,
} from './dto';

@ApiTags('Stats')
@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USUARIO, UserRole.ADMINISTRADOR)
@ApiBearerAuth('JWT-auth')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('total')
  @ApiOperation({
    summary: 'Total de excepciones con comparación al período anterior',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Fecha inicio (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Fecha fin (ISO 8601)',
  })
  @ApiQuery({ name: 'platformId', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Total de excepciones' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async getTotal(
    @Query() filters: StatsFilterDto,
  ): Promise<TotalStatsResponseDto> {
    return this.statsService.getTotal(filters);
  }

  @Get('by-time')
  @ApiOperation({ summary: 'Excepciones agrupadas por tiempo y nivel' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Fecha inicio (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Fecha fin (ISO 8601)',
  })
  @ApiQuery({ name: 'platformId', required: false, type: Number })
  @ApiQuery({ name: 'levelId', required: false, type: Number })
  @ApiQuery({
    name: 'granularity',
    required: false,
    enum: ['hour', 'day'],
    description: 'Granularidad (auto si no se especifica)',
  })
  @ApiResponse({ status: 200, description: 'Serie temporal de excepciones' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  getByTime(@Query() filters: TimeStatsFilterDto): TimeStatsResponseDto {
    return this.statsService.getByTime(filters);
  }

  @Get('by-platform')
  @ApiOperation({ summary: 'Distribución de excepciones por plataforma' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Fecha inicio (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Fecha fin (ISO 8601)',
  })
  @ApiResponse({ status: 200, description: 'Distribución por plataforma' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  getByPlatform(@Query() filters: StatsFilterDto): PlatformStatsResponseDto {
    return this.statsService.getByPlatform(filters);
  }

  @Get('grouped-by-message')
  @ApiOperation({ summary: 'Excepciones agrupadas por mensaje' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Fecha inicio (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Fecha fin (ISO 8601)',
  })
  @ApiQuery({ name: 'platformId', required: false, type: Number })
  @ApiQuery({ name: 'levelId', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Excepciones agrupadas' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  getGroupedByMessage(
    @Query() filters: GroupedExceptionsFilterDto,
  ): GroupedExceptionsResponseDto {
    return this.statsService.getGroupedByMessage(filters);
  }
}
