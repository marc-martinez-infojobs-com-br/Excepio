import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import type { LevelResponseDto } from '@excepio/shared';
import { LevelService } from './level.service';

@ApiTags('Level')
@Controller('level')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los niveles activos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de niveles activos',
  })
  async findAll(): Promise<LevelResponseDto[]> {
    return this.levelService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un nivel por ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID del nivel' })
  @ApiResponse({
    status: 200,
    description: 'Nivel encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Nivel no encontrado',
  })
  async findById(@Param('id', ParseIntPipe) id: number): Promise<LevelResponseDto> {
    return this.levelService.findById(id);
  }
}
