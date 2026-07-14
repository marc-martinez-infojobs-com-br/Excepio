import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectDto } from '@excepio/shared';
import { UserRole } from '@excepio/shared';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@ApiTags('Projects')
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @Roles(UserRole.USUARIO, UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener todos los proyectos' })
  @ApiResponse({ status: 200, description: 'Lista de proyectos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  async findAll(): Promise<ProjectDto[]> {
    return this.projectService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.USUARIO, UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener un proyecto por ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID del proyecto' })
  @ApiResponse({ status: 200, description: 'Proyecto encontrado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<ProjectDto> {
    return this.projectService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear un nuevo proyecto (solo ADMINISTRADOR)' })
  @ApiResponse({ status: 201, description: 'Proyecto creado (incluye apiKey generada)' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo ADMINISTRADOR' })
  @ApiResponse({ status: 409, description: 'El ID ya existe' })
  async create(@Body() createProjectDto: CreateProjectDto): Promise<ProjectDto> {
    return this.projectService.create(createProjectDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar un proyecto (solo ADMINISTRADOR)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID del proyecto' })
  @ApiResponse({ status: 200, description: 'Proyecto actualizado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo ADMINISTRADOR' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectDto> {
    return this.projectService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Eliminar un proyecto (borrado lógico, solo ADMINISTRADOR)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID del proyecto' })
  @ApiResponse({ status: 200, description: 'Proyecto eliminado' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo ADMINISTRADOR' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  async delete(@Param('id', ParseIntPipe) id: number): Promise<ProjectDto> {
    return this.projectService.delete(id);
  }

  @Post(':id/regenerate')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Regenerar API Key de un proyecto (solo ADMINISTRADOR)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID del proyecto' })
  @ApiResponse({ status: 200, description: 'API Key regenerada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'Acceso denegado - Solo ADMINISTRADOR' })
  @ApiResponse({ status: 404, description: 'Proyecto no encontrado' })
  async regenerate(@Param('id', ParseIntPipe) id: number): Promise<ProjectDto> {
    return this.projectService.regenerate(id);
  }
}
