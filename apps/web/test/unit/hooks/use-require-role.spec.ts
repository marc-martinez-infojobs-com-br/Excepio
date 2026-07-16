import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRequireRole } from '@hooks/use-require-role';
import { UserRole } from '@excepio/shared';

// Mock de next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock de useAuth
const mockUser = vi.fn();
const mockIsLoading = vi.fn(() => false);
vi.mock('@hooks/use-auth', () => ({
  useAuth: () => ({
    user: mockUser(),
    isLoading: mockIsLoading(),
  }),
}));

// Mock de toast
const mockToast = vi.fn();
vi.mock('@hooks/use-toast', () => ({
  toast: (...args: unknown[]) => mockToast(...args),
}));

// Mock de next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      accessDenied: 'No tienes permisos para acceder a esta sección',
    };
    return translations[key] || key;
  }),
}));

describe('useRequireRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading.mockReturnValue(false);
  });

  describe('cuando el usuario tiene el rol requerido', () => {
    it('debería retornar hasAccess=true para ADMINISTRADOR accediendo a ruta de admin', () => {
      mockUser.mockReturnValue({
        id: '1',
        email: 'admin@test.com',
        name: 'Admin',
        role: UserRole.ADMINISTRADOR,
        statusId: 2,
      });

      const { result } = renderHook(() =>
        useRequireRole([UserRole.ADMINISTRADOR])
      );

      expect(result.current.hasAccess).toBe(true);
      expect(result.current.isChecking).toBe(false);
      expect(mockPush).not.toHaveBeenCalled();
      expect(mockToast).not.toHaveBeenCalled();
    });

    it('debería retornar hasAccess=true para USUARIO accediendo a ruta permitida', () => {
      mockUser.mockReturnValue({
        id: '1',
        email: 'user@test.com',
        name: 'User',
        role: UserRole.USUARIO,
        statusId: 2,
      });

      const { result } = renderHook(() =>
        useRequireRole([UserRole.USUARIO, UserRole.ADMINISTRADOR])
      );

      expect(result.current.hasAccess).toBe(true);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('cuando el usuario NO tiene el rol requerido', () => {
    it('debería redirigir a /dashboard y mostrar toast de error', async () => {
      mockUser.mockReturnValue({
        id: '1',
        email: 'user@test.com',
        name: 'User',
        role: UserRole.USUARIO,
        statusId: 2,
      });

      const { result } = renderHook(() =>
        useRequireRole([UserRole.ADMINISTRADOR])
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'No tienes permisos para acceder a esta sección',
        variant: 'error',
      });
      expect(result.current.hasAccess).toBe(false);
    });
  });

  describe('cuando está cargando la autenticación', () => {
    it('debería retornar isChecking=true mientras carga', () => {
      mockIsLoading.mockReturnValue(true);
      mockUser.mockReturnValue(null);

      const { result } = renderHook(() =>
        useRequireRole([UserRole.ADMINISTRADOR])
      );

      expect(result.current.isChecking).toBe(true);
      expect(result.current.hasAccess).toBe(false);
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('cuando no hay usuario autenticado', () => {
    it('debería redirigir a /dashboard', async () => {
      mockUser.mockReturnValue(null);

      renderHook(() => useRequireRole([UserRole.ADMINISTRADOR]));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });
  });
});
