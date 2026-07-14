import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, Inject } from '@nestjs/common';
import type { ProjectRepository } from '../../project/repository';
import { PROJECT_REPOSITORY } from '../../project/repository';

/**
 * Guard de autenticación por API Key.
 * Valida el header X-API-Key y adjunta el proyecto al request.
 *
 * Uso:
 * @UseGuards(ApiKeyAuthGuard)
 */
@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API Key is required');
    }

    const project = await this.projectRepository.findByApiKey(apiKey);

    if (!project) {
      throw new UnauthorizedException('Invalid API Key');
    }

    // Adjuntar proyecto al request para uso posterior
    request.project = project;

    return true;
  }
}
