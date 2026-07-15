import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '@app/(auth)/register/page';
import { useAuth } from '@hooks/use-auth';

// Mock del useAuth
vi.mock('@hooks/use-auth', () => ({
  useAuth: vi.fn(),
}));

// Mock de next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('RegisterPage', () => {
  const mockRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      login: vi.fn(),
      logout: vi.fn(),
      register: mockRegister,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  describe('rendering', () => {
    it('debería renderizar Card con título "Crear cuenta"', () => {
      render(<RegisterPage />);

      // Con el mock de i18n, se muestra la key de traducción
      expect(screen.getByText(/auth\.register\.title/)).toBeInTheDocument();
    });

    it('debería renderizar descripción "Crea tu cuenta en Excepio"', () => {
      render(<RegisterPage />);

      expect(screen.getByText(/auth\.register\.subtitle/)).toBeInTheDocument();
    });

    it('debería contener RegisterForm', () => {
      render(<RegisterPage />);

      // Verificamos elementos del RegisterForm con keys de traducción
      expect(screen.getByPlaceholderText(/auth\.register\.namePlaceholder/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/auth\.register\.emailPlaceholder/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /auth\.register\.submit/ })).toBeInTheDocument();
    });

    it('debería renderizar footer con link a login', () => {
      render(<RegisterPage />);

      // El texto del footer usa key de traducción
      expect(screen.getByText(/auth\.register\.hasAccount/)).toBeInTheDocument();
      
      const loginLink = screen.getByRole('link', { name: /auth\.register\.signIn/ });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  describe('flujo completo', () => {
    it('debería llamar a register con datos válidos', async () => {
      const user = userEvent.setup();
      mockRegister.mockResolvedValue(undefined);
      render(<RegisterPage />);

      const passwordFields = screen.getAllByPlaceholderText('••••••••');

      await user.type(screen.getByPlaceholderText(/auth\.register\.namePlaceholder/), 'Test User');
      await user.type(screen.getByPlaceholderText(/auth\.register\.emailPlaceholder/), 'test@example.com');
      await user.type(passwordFields[0], 'Password1!');
      await user.type(passwordFields[1], 'Password1!');
      await user.click(screen.getByRole('button', { name: /auth\.register\.submit/ }));

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test User',
            email: 'test@example.com',
            password: 'Password1!',
          })
        );
      });
    });

    it('debería mostrar error cuando el registro falla', async () => {
      const user = userEvent.setup();
      mockRegister.mockRejectedValue(new Error('El email ya está registrado'));
      render(<RegisterPage />);

      const passwordFields = screen.getAllByPlaceholderText('••••••••');

      await user.type(screen.getByPlaceholderText(/auth\.register\.namePlaceholder/), 'Test User');
      await user.type(screen.getByPlaceholderText(/auth\.register\.emailPlaceholder/), 'test@example.com');
      await user.type(passwordFields[0], 'Password1!');
      await user.type(passwordFields[1], 'Password1!');
      await user.click(screen.getByRole('button', { name: /auth\.register\.submit/ }));

      await waitFor(() => {
        expect(screen.getByText(/el email ya está registrado/i)).toBeInTheDocument();
      });
    });
  });
});
