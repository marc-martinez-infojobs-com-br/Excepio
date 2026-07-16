import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PlatformsPage from '@app/(dashboard)/platforms/page';
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
      platforms: 'Plataformas',
    };
    return translations[key] || key;
  }),
}));

describe('PlatformsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsLoading.mockReturnValue(false);
  });

  describe('para usuario ADMINISTRADOR', () => {
    beforeEach(() => {
      mockUser.mockReturnValue({
        id: '1',
        email: 'admin@test.com',
        name: 'Admin',
        role: UserRole.ADMINISTRADOR,
        statusId: 2,
      });
    });

    it('debería renderizar la página correctamente', () => {
      render(<PlatformsPage />);

      expect(screen.getByText('Plataformas')).toBeInTheDocument();
    });

    it('NO debería redirigir ni mostrar toast', () => {
      render(<PlatformsPage />);

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockToast).not.toHaveBeenCalled();
    });
  });

  describe('para usuario USUARIO', () => {
    beforeEach(() => {
      mockUser.mockReturnValue({
        id: '1',
        email: 'user@test.com',
        name: 'User',
        role: UserRole.USUARIO,
        statusId: 2,
      });
    });

    it('debería redirigir a /dashboard', async () => {
      render(<PlatformsPage />);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('debería mostrar toast de acceso denegado', async () => {
      render(<PlatformsPage />);

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'No tienes permisos para acceder a esta sección',
          variant: 'error',
        });
      });
    });
  });
});
