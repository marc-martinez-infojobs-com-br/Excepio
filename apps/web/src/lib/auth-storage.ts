import { jwtDecode } from 'jwt-decode';
import type { UserResponseDto, JwtPayload } from '@excepio/shared';

const TOKEN_KEY = 'excepio_token';
const USER_KEY = 'excepio_user';

export const authStorage = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(TOKEN_KEY, token);
  },

  getUser(): UserResponseDto | null {
    if (typeof window === 'undefined') return null;
    const user = sessionStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  setUser(user: UserResponseDto): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      
      // Verificar que tenga campo exp
      if (!decoded.exp) return false;
      
      // Comparar con tiempo actual (en segundos)
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    } catch (error) {
      // Token inválido o malformado
      return false;
    }
  },

  isAuthenticated(): boolean {
    return this.isTokenValid();
  },
};
