import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MainNav } from '@components/main-nav';
import { UserRole } from '@excepio/shared';

// Mock de next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      dashboard: 'Dashboard',
      issues: 'Incidencias',
      platforms: 'Plataformas',
      users: 'Usuarios',
    };
    return translations[key] || key;
  }),
}));

// Mock de next/navigation
const mockPathname = vi.fn(() => '/dashboard');
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

// Mock de useAuth
const mockUser = vi.fn();
vi.mock('@hooks/use-auth', () => ({
  useAuth: () => ({
    user: mockUser(),
  }),
}));

describe('MainNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname.mockReturnValue('/dashboard');
  });

  describe('para usuario con rol USUARIO', () => {
    beforeEach(() => {
      mockUser.mockReturnValue({
        id: '1',
        email: 'user@test.com',
        name: 'Test User',
        role: UserRole.USUARIO,
        statusId: 2,
      });
    });

    it('debería mostrar Dashboard e Incidencias', () => {
      render(<MainNav />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Incidencias')).toBeInTheDocument();
    });

    it('NO debería mostrar Plataformas ni Usuarios', () => {
      render(<MainNav />);

      expect(screen.queryByText('Plataformas')).not.toBeInTheDocument();
      expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
    });

    it('debería renderizar links con las rutas correctas', () => {
      render(<MainNav />);

      expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
        'href',
        '/dashboard'
      );
      expect(screen.getByRole('link', { name: 'Incidencias' })).toHaveAttribute(
        'href',
        '/issues'
      );
    });
  });

  describe('para usuario con rol ADMINISTRADOR', () => {
    beforeEach(() => {
      mockUser.mockReturnValue({
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        role: UserRole.ADMINISTRADOR,
        statusId: 2,
      });
    });

    it('debería mostrar todas las opciones de navegación', () => {
      render(<MainNav />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Incidencias')).toBeInTheDocument();
      expect(screen.getByText('Plataformas')).toBeInTheDocument();
      expect(screen.getByText('Usuarios')).toBeInTheDocument();
    });

    it('debería renderizar links con las rutas correctas para admin', () => {
      render(<MainNav />);

      expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
        'href',
        '/dashboard'
      );
      expect(screen.getByRole('link', { name: 'Incidencias' })).toHaveAttribute(
        'href',
        '/issues'
      );
      expect(screen.getByRole('link', { name: 'Plataformas' })).toHaveAttribute(
        'href',
        '/platforms'
      );
      expect(screen.getByRole('link', { name: 'Usuarios' })).toHaveAttribute(
        'href',
        '/users'
      );
    });
  });

  describe('indicador de ruta activa', () => {
    beforeEach(() => {
      mockUser.mockReturnValue({
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        role: UserRole.ADMINISTRADOR,
        statusId: 2,
      });
    });

    it('debería marcar Dashboard como activo cuando está en /dashboard', () => {
      mockPathname.mockReturnValue('/dashboard');
      render(<MainNav />);

      const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
      expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    });

    it('debería marcar Incidencias como activo cuando está en /issues', () => {
      mockPathname.mockReturnValue('/issues');
      render(<MainNav />);

      const issuesLink = screen.getByRole('link', { name: 'Incidencias' });
      expect(issuesLink).toHaveAttribute('aria-current', 'page');
    });

    it('debería marcar Plataformas como activo cuando está en /platforms', () => {
      mockPathname.mockReturnValue('/platforms');
      render(<MainNav />);

      const platformsLink = screen.getByRole('link', { name: 'Plataformas' });
      expect(platformsLink).toHaveAttribute('aria-current', 'page');
    });

    it('no debería marcar ningún link cuando la ruta no coincide', () => {
      mockPathname.mockReturnValue('/other-route');
      render(<MainNav />);

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        expect(link).not.toHaveAttribute('aria-current', 'page');
      });
    });
  });

  describe('cuando no hay usuario autenticado', () => {
    it('debería mostrar solo las opciones básicas', () => {
      mockUser.mockReturnValue(null);
      render(<MainNav />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Incidencias')).toBeInTheDocument();
      expect(screen.queryByText('Plataformas')).not.toBeInTheDocument();
      expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
    });
  });
});
