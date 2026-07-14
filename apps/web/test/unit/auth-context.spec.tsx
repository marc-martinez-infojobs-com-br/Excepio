import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, renderHook } from '@testing-library/react';
import { act } from 'react';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { authStorage } from '@/lib/auth-storage';
import { apiClient } from '@/lib/api-client';
import type { UserResponseDto } from '@excepio/shared';

// Mock de authStorage
vi.mock('@/lib/auth-storage', () => ({
  authStorage: {
    getToken: vi.fn(),
    setToken: vi.fn(),
    getUser: vi.fn(),
    setUser: vi.fn(),
    clear: vi.fn(),
    isAuthenticated: vi.fn(),
  },
}));

// Mock de apiClient
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

// Mock de next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Componente de prueba
function TestComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'ready'}</div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <div data-testid="user-email">{user?.email || 'no-user'}</div>
      <button onClick={() => login({ email: 'test@test.com', password: 'password' })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  const mockUser: UserResponseDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@test.com',
    name: 'Test User',
    role: 'USUARIO',
    statusId: 2,
    lastLoginAt: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    vi.mocked(authStorage.getUser).mockReturnValue(null);
    vi.mocked(authStorage.isAuthenticated).mockReturnValue(false);
  });

  it('debería iniciar sin autenticar', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('no-user');
  });

  it('debería cargar usuario desde storage al montar', () => {
    vi.mocked(authStorage.getUser).mockReturnValue(mockUser);
    vi.mocked(authStorage.isAuthenticated).mockReturnValue(true);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    expect(screen.getByTestId('user-email')).toHaveTextContent('test@test.com');
  });

  it('debería cambiar isLoading a ready después de montar', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Después de montar debería estar ready
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });
  });

  it('debería hacer login correctamente', async () => {
    const mockResponse = {
      data: {
        access_token: 'fake-token',
        user: mockUser,
      },
    };
    vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Esperar a que termine el loading inicial
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    // Hacer login
    await act(async () => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'password',
      });
      expect(authStorage.setToken).toHaveBeenCalledWith('fake-token');
      expect(authStorage.setUser).toHaveBeenCalledWith(mockUser);
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('debería hacer logout correctamente', async () => {
    vi.mocked(authStorage.getUser).mockReturnValue(mockUser);
    vi.mocked(authStorage.isAuthenticated).mockReturnValue(true);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Esperar a que cargue
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated');
    });

    // Hacer logout
    await act(async () => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(authStorage.clear).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  it('debería manejar errores en login', async () => {
    const mockError = new Error('Invalid credentials');
    vi.mocked(apiClient.post).mockRejectedValue(mockError);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      try {
        await result.current.login({ email: 'test@test.com', password: 'wrong' });
      } catch (error) {
        // Ahora el auth-context lanza un error genérico por seguridad
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('Error al iniciar sesión. Inténtalo de nuevo más tarde.');
      }
    });

    expect(authStorage.setToken).not.toHaveBeenCalled();
    expect(authStorage.setUser).not.toHaveBeenCalled();
  });

  it('debería lanzar error si useAuth se usa fuera de AuthProvider', () => {
    // Capturar error de consola
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth debe usarse dentro de AuthProvider');

    consoleError.mockRestore();
  });
});
