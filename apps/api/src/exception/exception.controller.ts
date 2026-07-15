import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { ExceptionDto, ExceptionListResponseDto, UserRole } from '@excepio/shared';
import type { PlatformDto } from '@excepio/shared';
import { ExceptionService } from './exception.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiKeyAuthGuard } from '../auth/guards/api-key-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentPlatform } from '../auth/decorators/current-platform.decorator';
import { CreateExceptionDto, ExceptionFilterDto } from './dto';

@ApiTags('Exceptions')
@Controller('exceptions')
export class ExceptionController {
  constructor(private readonly exceptionService: ExceptionService) {}

  @Post()
  @UseGuards(ApiKeyAuthGuard)
  @ApiOperation({ summary: 'Reportar una excepción (requiere API Key)' })
  @ApiHeader({ name: 'X-API-Key', description: 'API Key de la plataforma', required: true })
  @ApiResponse({ status: 201, description: 'Excepción creada' })
  @ApiResponse({ status: 401, description: 'API Key inválida o faltante' })
  async create(
    @CurrentPlatform() platform: PlatformDto,
    @Body() createExceptionDto: CreateExceptionDto,
  ): Promise<ExceptionDto> {
    return this.exceptionService.create(platform.id, createExceptionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USUARIO, UserRole.ADMINISTRADOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener excepciones con filtros (requiere JWT)' })
  @ApiQuery({ name: 'platformId', required: false, type: Number })
  @ApiQuery({ name: 'levelId', required: false, type: Number })
  @ApiQuery({ name: 'userId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'messageSearch', required: false, type: String })
  @ApiQuery({ name: 'urlSearch', required: false, type: String })
  @ApiQuery({ name: 'userAgentSearch', required: false, type: String })
  @ApiQuery({ name: 'appVersionSearch', required: false, type: String })
  @ApiQuery({ name: 'stackTraceSearch', required: false, type: String })
  @ApiQuery({ name: 'metadataSearch', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiResponse({ status: 200, description: 'Lista paginada de excepciones' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async findAll(@Query() filters: ExceptionFilterDto): Promise<ExceptionListResponseDto> {
    return this.exceptionService.findAll(filters);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.USUARIO, UserRole.ADMINISTRADOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtener una excepción por ID (requiere JWT)' })
  @ApiParam({ name: 'id', type: 'string', description: 'ID de la excepción (UUID)' })
  @ApiResponse({ status: 200, description: 'Excepción encontrada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Excepción no encontrada' })
  async findById(@Param('id') id: string): Promise<ExceptionDto> {
    return this.exceptionService.findById(id);
  }
}
