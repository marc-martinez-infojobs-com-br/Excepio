import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PlatformsPage from '@app/(dashboard)/platforms/page';
import { UserRole } from '@excepio/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

// Mock de toast (función directa para useRequireRole)
const mockToast = vi.fn();
vi.mock('@hooks/use-toast', () => ({
  toast: (...args: unknown[]) => mockToast(...args),
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock de usePlatforms
vi.mock('@hooks/use-platforms', () => ({
  usePlatforms: () => ({
    data: [],
    isLoading: false,
    error: null,
  }),
}));

// Mock de usePlatformMutations
vi.mock('@hooks/use-platform-mutations', () => ({
  usePlatformMutations: () => ({
    createPlatform: { mutateAsync: vi.fn(), isPending: false },
    updatePlatform: { mutateAsync: vi.fn(), isPending: false },
    deletePlatform: { mutateAsync: vi.fn(), isPending: false },
    regenerateApiKey: { mutateAsync: vi.fn(), isPending: false },
  }),
}));

// Mock de next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      accessDenied: 'No tienes permisos para acceder a esta sección',
      platforms: 'Plataformas',
      title: 'Plataformas',
      empty: 'No hay plataformas registradas',
      'create.button': 'Nueva plataforma',
    };
    return translations[key] || key;
  }),
}));

// Helper para envolver en QueryClientProvider
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

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
      render(<PlatformsPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Plataformas')).toBeInTheDocument();
    });

    it('NO debería redirigir ni mostrar toast', () => {
      render(<PlatformsPage />, { wrapper: createWrapper() });

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
      render(<PlatformsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('debería mostrar toast de acceso denegado', async () => {
      render(<PlatformsPage />, { wrapper: createWrapper() });

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'No tienes permisos para acceder a esta sección',
          variant: 'error',
        });
      });
    });
  });
});
