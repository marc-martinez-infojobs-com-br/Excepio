import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  // Configuración CORS
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN') || 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Configuración Swagger/OpenAPI
  const config = new DocumentBuilder()
    .setTitle('Excepio API')
    .setDescription('API para el sistema de registro de excepciones')
    .setVersion('0.0.1')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/swagger', app, document);

  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);

  console.log(`🚀 API running on http://localhost:${port}/api`);
  console.log(`📚 Swagger docs on http://localhost:${port}/api/swagger`);
}
bootstrap();
