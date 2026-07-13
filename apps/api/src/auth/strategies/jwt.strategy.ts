import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { JwtPayload, UserResponseDto } from '@excepio/shared';
import { UserService } from '../../user/user.service';

/**
 * Estrategia JWT para Passport.
 * Valida el token JWT y carga el usuario en el request.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
    });
  }

  /**
   * Valida el payload del JWT y retorna el usuario.
   * Este método se llama automáticamente por Passport después de validar el token.
   * @param payload - Payload del JWT
   * @returns Usuario autenticado
   */
  async validate(payload: JwtPayload): Promise<UserResponseDto> {
    try {
      const user = await this.userService.findById(payload.sub);
      
      // Verificar que el usuario esté activo (statusId = 2)
      if (user.statusId !== 2) {
        throw new UnauthorizedException('User is not active');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
