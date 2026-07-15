import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { PlatformDto } from '@excepio/shared';

/**
 * Decorador de parámetro para extraer la plataforma del request.
 * Requiere que ApiKeyAuthGuard se haya ejecutado previamente.
 *
 * Uso:
 * @UseGuards(ApiKeyAuthGuard)
 * @Post()
 * create(@CurrentPlatform() platform: PlatformDto) {
 *   console.log(platform.id);
 * }
 */
export const CurrentPlatform = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PlatformDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.platform;
  },
);
