import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import type { PlatformRepository } from '@platform/repository';
import { PLATFORM_REPOSITORY } from '@platform/repository';

/**
 * Guard de autenticación por API Key.
 * Valida el header X-API-Key y adjunta la plataforma al request.
 *
 * Uso:
 * @UseGuards(ApiKeyAuthGuard)
 */
@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    @Inject(PLATFORM_REPOSITORY)
    private readonly platformRepository: PlatformRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API Key is required');
    }

    const platform = await this.platformRepository.findByApiKey(apiKey);

    if (!platform) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // Adjuntar plataforma al request para uso posterior
    request.platform = platform;

    return true;
  }
}
