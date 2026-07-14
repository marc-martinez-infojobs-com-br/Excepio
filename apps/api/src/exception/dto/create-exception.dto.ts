import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max, MinLength, IsOptional, IsObject } from 'class-validator';

export class CreateExceptionDto {
  @ApiProperty({
    description: 'Nivel de severidad (1=DEBUG, 2=INFO, 3=WARNING, 4=ERROR, 5=FATAL)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  levelId: number;

  @ApiProperty({
    description: 'Mensaje de la excepción',
    example: 'NullPointerException: Cannot read property of undefined',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  message: string;

  @ApiPropertyOptional({
    description: 'Stack trace completo',
    example: 'at getUserData (app.js:45:12)\nat processUser (app.js:32:5)',
  })
  @IsOptional()
  @IsString()
  stackTrace?: string;

  @ApiPropertyOptional({
    description: 'Identificador del usuario afectado',
    example: 'user_12345',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'URL o ruta donde ocurrió la excepción',
    example: '/api/users/profile',
  })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({
    description: 'User Agent del navegador o cliente',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Versión de la aplicación',
    example: '1.2.3',
  })
  @IsOptional()
  @IsString()
  appVersion?: string;

  @ApiPropertyOptional({
    description: 'Metadatos adicionales en formato JSON',
    example: { userId: 123, action: 'getData', timestamp: 1234567890 },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
