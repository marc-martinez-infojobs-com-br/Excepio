import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsInt, Min } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Identificador numérico único del proyecto',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  id: number;

  @ApiProperty({
    description: 'Nombre del proyecto',
    example: 'Mi Aplicación Web',
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}
