import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MobileNav } from '@components/navigation/mobile-nav';
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

describe('MobileNav', () => {
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
      render(<MobileNav />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Incidencias')).toBeInTheDocument();
    });

    it('NO debería mostrar Plataformas ni Usuarios', () => {
      render(<MobileNav />);

      expect(screen.queryByText('Plataformas')).not.toBeInTheDocument();
      expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
    });

    it('debería renderizar links con las rutas correctas', () => {
      render(<MobileNav />);

      expect(screen.getByRole('link', { name: /Dashboard/i })).toHaveAttribute(
        'href',
        '/dashboard'
      );
      expect(screen.getByRole('link', { name: /Incidencias/i })).toHaveAttribute(
        'href',
        '/issues'
      );
    });

    it('debería tener la clase md:hidden para ocultarse en desktop', () => {
      const { container } = render(<MobileNav />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('md:hidden');
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
      render(<MobileNav />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Incidencias')).toBeInTheDocument();
      expect(screen.getByText('Plataformas')).toBeInTheDocument();
      expect(screen.getByText('Usuarios')).toBeInTheDocument();
    });

    it('debería renderizar links con las rutas correctas para admin', () => {
      render(<MobileNav />);

      expect(screen.getByRole('link', { name: /Dashboard/i })).toHaveAttribute(
        'href',
        '/dashboard'
      );
      expect(screen.getByRole('link', { name: /Incidencias/i })).toHaveAttribute(
        'href',
        '/issues'
      );
      expect(screen.getByRole('link', { name: /Plataformas/i })).toHaveAttribute(
        'href',
        '/platforms'
      );
      expect(screen.getByRole('link', { name: /Usuarios/i })).toHaveAttribute(
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
      render(<MobileNav />);

      const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
      expect(dashboardLink).toHaveAttribute('aria-current', 'page');
    });

    it('debería marcar Incidencias como activo cuando está en /issues', () => {
      mockPathname.mockReturnValue('/issues');
      render(<MobileNav />);

      const issuesLink = screen.getByRole('link', { name: /Incidencias/i });
      expect(issuesLink).toHaveAttribute('aria-current', 'page');
    });

    it('debería marcar Plataformas como activo cuando está en /platforms', () => {
      mockPathname.mockReturnValue('/platforms');
      render(<MobileNav />);

      const platformsLink = screen.getByRole('link', { name: /Plataformas/i });
      expect(platformsLink).toHaveAttribute('aria-current', 'page');
    });
  });

  describe('diseño bottom navigation', () => {
    beforeEach(() => {
      mockUser.mockReturnValue({
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        role: UserRole.ADMINISTRADOR,
        statusId: 2,
      });
    });

    it('debería estar fijado en la parte inferior', () => {
      const { container } = render(<MobileNav />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('fixed');
      expect(nav).toHaveClass('bottom-0');
    });

    it('debería tener fondo y borde superior', () => {
      const { container } = render(<MobileNav />);
      const nav = container.querySelector('nav');
      expect(nav).toHaveClass('bg-card');
      expect(nav).toHaveClass('border-t');
    });
  });

  describe('cuando no hay usuario autenticado', () => {
    it('debería mostrar solo las opciones básicas', () => {
      mockUser.mockReturnValue(null);
      render(<MobileNav />);

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Incidencias')).toBeInTheDocument();
      expect(screen.queryByText('Plataformas')).not.toBeInTheDocument();
      expect(screen.queryByText('Usuarios')).not.toBeInTheDocument();
    });
  });
});
