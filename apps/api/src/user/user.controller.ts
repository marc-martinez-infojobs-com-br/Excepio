import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { UserResponseDto } from '@excepio/shared';
import { UserRole } from '@excepio/shared';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CreateUserDto, UpdateUserDto, ResetPasswordDto } from './dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserRole.USUARIO, UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado',
  })
  async findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  @Roles(UserRole.USUARIO, UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Obtener un usuario por ID' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID del usuario (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findById(id);
  }

  @Post()
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Crear un nuevo usuario (solo ADMINISTRADOR)' })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo ADMINISTRADOR',
  })
  @ApiResponse({
    status: 409,
    description: 'El email ya existe',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({ summary: 'Actualizar un usuario (solo ADMINISTRADOR)' })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID del usuario (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo ADMINISTRADOR',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Eliminar un usuario - solo ADMINISTRADOR (borrado lógico)',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID del usuario (UUID)',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario eliminado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'No puedes eliminarte a ti mismo',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo ADMINISTRADOR',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async delete(
    @CurrentUser() currentUser: UserResponseDto,
    @Param('id') id: string,
  ): Promise<UserResponseDto> {
    // Validar que el usuario no se elimine a sí mismo
    if (currentUser.id === id) {
      throw new BadRequestException('You cannot delete yourself');
    }
    return this.userService.delete(id);
  }

  @Post(':id/activate')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Activar un usuario eliminado - solo ADMINISTRADOR',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID del usuario (UUID)',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario activado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo ADMINISTRADOR',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async activate(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.activate(id);
  }

  @Post(':id/reset-password')
  @Roles(UserRole.ADMINISTRADOR)
  @ApiOperation({
    summary: 'Resetear contraseña de un usuario - solo ADMINISTRADOR',
  })
  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'ID del usuario (UUID)',
  })
  @ApiResponse({
    status: 201,
    description: 'Contraseña reseteada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Las contraseñas no coinciden',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'Acceso denegado - Solo ADMINISTRADOR',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  async resetPassword(
    @Param('id') id: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<UserResponseDto> {
    // Validar que las contraseñas coincidan
    if (resetPasswordDto.newPassword !== resetPasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    return this.userService.resetPassword(id, resetPasswordDto.newPassword);
  }
}
