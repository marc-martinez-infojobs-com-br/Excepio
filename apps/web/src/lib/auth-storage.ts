import { jwtDecode } from 'jwt-decode';
import type { UserResponseDto, JwtPayload } from '@excepio/shared';

const TOKEN_KEY = 'excepio_token';
const USER_KEY = 'excepio_user';

// Helper para cookies
const setCookie = (name: string, value: string) => {
  if (typeof document === 'undefined') return;
  // Cookie de sesión (se borra al cerrar el navegador)
  document.cookie = `${name}=${value}; path=/; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

export const authStorage = {
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    // También guardar en cookie para el middleware
    setCookie(TOKEN_KEY, token);
  },

  getUser(): UserResponseDto | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  setUser(user: UserResponseDto): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // También limpiar cookie
    deleteCookie(TOKEN_KEY);
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
