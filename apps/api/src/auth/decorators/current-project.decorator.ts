import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ProjectDto } from '@excepio/shared';

/**
 * Decorador de parámetro para extraer el proyecto del request.
 * Requiere que ApiKeyAuthGuard se haya ejecutado previamente.
 *
 * Uso:
 * @UseGuards(ApiKeyAuthGuard)
 * @Post()
 * create(@CurrentProject() project: ProjectDto) {
 *   console.log(project.id);
 * }
 */
export const CurrentProject = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ProjectDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.project;
  },
);
