import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PlatformDto } from '@excepio/shared';
import { UserRole } from '@excepio/shared';
import { PlatformService } from './platform.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreatePlatformDto, UpdatePlatformDto } from './dto';

@ApiTags('Platforms')
@Controller('platforms')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Get()
  @Roles(UserRole.USUARIO, UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener todas las plataformas' })
  @ApiResponse({ status: 200, description: 'Lista de plataformas' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async findAll(): Promise<PlatformDto[]> {
    return this.platformService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.USUARIO, UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener una plataforma por ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la plataforma' })
  @ApiResponse({ status: 200, description: 'Plataforma encontrada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Plataforma no encontrada' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<PlatformDto> {
    return this.platformService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear una nueva plataforma (solo ADMINISTRADOR)' })
  @ApiResponse({
    status: 201,
    description: 'Plataforma creada (incluye apiKey generada)',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo ADMINISTRADOR',
  })
  @ApiResponse({ status: 409, description: 'El ID ya existe' })
  async create(
    @Body() createPlatformDto: CreatePlatformDto,
  ): Promise<PlatformDto> {
    return this.platformService.create(createPlatformDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar una plataforma (solo ADMINISTRADOR)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la plataforma' })
  @ApiResponse({ status: 200, description: 'Plataforma actualizada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo ADMINISTRADOR',
  })
  @ApiResponse({ status: 404, description: 'Plataforma no encontrada' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePlatformDto: UpdatePlatformDto,
  ): Promise<PlatformDto> {
    return this.platformService.update(id, updatePlatformDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Eliminar una plataforma (borrado lógico, solo ADMINISTRADOR)',
  })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la plataforma' })
  @ApiResponse({ status: 200, description: 'Plataforma eliminada' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo ADMINISTRADOR',
  })
  @ApiResponse({ status: 404, description: 'Plataforma no encontrada' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<PlatformDto> {
    return this.platformService.delete(id);
  }

  @Post(':id/regenerate')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Regenerar API Key de una plataforma (solo ADMINISTRADOR)',
  })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la plataforma' })
  @ApiResponse({ status: 200, description: 'API Key regenerada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo ADMINISTRADOR',
  })
  @ApiResponse({ status: 404, description: 'Plataforma no encontrada' })
  async regenerate(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PlatformDto> {
    return this.platformService.regenerate(id);
  }

  @Post(':id/activate')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Activar una plataforma eliminada (solo ADMINISTRADOR)',
  })
  @ApiParam({ name: 'id', type: 'number', description: 'ID de la plataforma' })
  @ApiResponse({ status: 200, description: 'Plataforma activada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo ADMINISTRADOR',
  })
  @ApiResponse({ status: 404, description: 'Plataforma no encontrada' })
  async activate(@Param('id', ParseIntPipe) id: number): Promise<PlatformDto> {
    return this.platformService.activate(id);
  }
}
