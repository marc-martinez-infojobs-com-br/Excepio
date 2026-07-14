import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { RegisterBackendDto, LoginDto, LoginResponseDto, UserResponseDto, JwtPayload } from '@excepio/shared';
import { UserService } from '../user';
import { USER_REPOSITORY, type UserRepository } from '../user/repository';
import * as bcrypt from 'bcrypt';

/**
 * Servicio de autenticación.
 * Maneja registro, login y validación de usuarios.
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  /**
   * Registra un nuevo usuario y retorna un JWT.
   * @param registerDto - Datos del usuario a registrar
   * @returns Token JWT y datos del usuario
   */
  async register(registerDto: RegisterBackendDto): Promise<LoginResponseDto> {
    // Crear el usuario (UserService ya valida email duplicado)
    const user = await this.userService.create({
      ...registerDto,
      role: undefined, // Por defecto será USUARIO
    });

    // Generar JWT
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user,
    };
  }

  /**
   * Autentica un usuario y retorna un JWT.
   * @param loginDto - Credenciales de login
   * @returns Token JWT y datos del usuario
   * @throws UnauthorizedException si las credenciales son inválidas
   */
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    // Validar credenciales
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Actualizar último login
    await this.userRepository.updateLastLogin(user.id);

    // Obtener usuario actualizado
    const updatedUser = await this.userService.findById(user.id);

    // Generar JWT
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: updatedUser,
    };
  }

  /**
   * Valida las credenciales de un usuario.
   * @param email - Email del usuario
   * @param password - Contraseña en texto plano
   * @returns Usuario si las credenciales son válidas, null si no
   */
  async validateUser(email: string, password: string): Promise<UserResponseDto | null> {
    // Buscar usuario por email
    const userPassword = await this.userRepository.findPasswordByEmail(email);
    if (!userPassword) {
      return null;
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, userPassword);
    if (!isPasswordValid) {
      return null;
    }

    // Retornar usuario sin password
    const user = await this.userRepository.findByEmail(email);
    return user;
  }
}
