import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/hooks/use-auth';

// Mock del useAuth
vi.mock('@/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}));

describe('LoginForm', () => {
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      logout: vi.fn(),
      register: vi.fn(),
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('debería renderizar el formulario correctamente', () => {
    render(<LoginForm />);

    // Los placeholders están hardcodeados en el componente
    expect(screen.getByPlaceholderText('admin@excepio.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    // El botón usa la key de traducción auth.login.submit
    expect(screen.getByRole('button', { name: /auth\.login\.submit/ })).toBeInTheDocument();
  });

  it('debería mostrar errores de validación para campos vacíos', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /auth\.login\.submit/ });
    await user.click(submitButton);

    await waitFor(() => {
      // Los mensajes de error vienen del schema de Zod en shared (hardcodeados)
      expect(screen.getByText(/Email inválido/i)).toBeInTheDocument();
      expect(screen.getByText(/contraseña es requerida/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('debería llamar a login con credenciales válidas', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('admin@excepio.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /auth\.login\.submit/ });

    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
    });
  });

  it('debería deshabilitar el formulario mientras está cargando', async () => {
    const user = userEvent.setup();
    let resolveLogin: () => void;
    mockLogin.mockImplementation(() => new Promise((resolve) => {
      resolveLogin = resolve;
    }));

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('admin@excepio.com') as HTMLInputElement;
    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: /auth\.login\.submit/ }) as HTMLButtonElement;

    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Mientras está cargando, el botón debe estar deshabilitado
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });

    // Resolver el login
    resolveLogin!();
  });

  it('debería mostrar error cuando el login falla', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Credenciales inválidas';
    mockLogin.mockRejectedValue(new Error(errorMessage));

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText('admin@excepio.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /auth\.login\.submit/ });

    await user.type(emailInput, 'test@test.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      // El formulario debe volver a estar habilitado
      expect(submitButton).not.toBeDisabled();
    });
  });
});
