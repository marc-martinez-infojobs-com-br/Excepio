import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserResponseDto } from '@excepio/shared';

/**
 * Decorador de parámetro para extraer el usuario actual del request.
 * Requiere que JwtAuthGuard se haya ejecutado previamente.
 *
 * Uso:
 * @UseGuards(JwtAuthGuard)
 * @Delete(':id')
 * delete(@CurrentUser() user: UserResponseDto, @Param('id') id: string) {
 *   console.log(user.id);
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserResponseDto => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
