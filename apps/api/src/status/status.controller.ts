import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import type { StatusResponseDto } from '@excepio/shared';
import { StatusService } from './status.service';

@ApiTags('Status')
@Controller('status')
export class StatusController {
  constructor(private readonly statusService: StatusService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todos los status' })
  @ApiResponse({
    status: 200,
    description: 'Lista de status',
  })
  async findAll(): Promise<StatusResponseDto[]> {
    return this.statusService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un status por ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID del status' })
  @ApiResponse({
    status: 200,
    description: 'Status encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Status no encontrado',
  })
  async findById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<StatusResponseDto> {
    return this.statusService.findById(id);
  }
}
