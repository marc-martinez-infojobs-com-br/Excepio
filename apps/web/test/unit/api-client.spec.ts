import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient } from '@/lib/api-client';
import { authStorage } from '@/lib/auth-storage';
import type { InternalAxiosRequestConfig } from 'axios';

// Mock del authStorage
vi.mock('@/lib/auth-storage', () => ({
  authStorage: {
    getToken: vi.fn(),
    clear: vi.fn(),
  },
}));

describe('apiClient - Request Interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería agregar Authorization header si hay token', () => {
    const mockToken = 'fake-jwt-token';
    vi.mocked(authStorage.getToken).mockReturnValue(mockToken);

    // Simular config de request
    const config: InternalAxiosRequestConfig = {
      headers: {} as any,
    } as InternalAxiosRequestConfig;

    // Obtener el interceptor (el último agregado)
    const interceptors = (apiClient.interceptors.request as any).handlers;
    const lastInterceptor = interceptors[interceptors.length - 1];
    
    if (lastInterceptor && lastInterceptor.fulfilled) {
      const result = lastInterceptor.fulfilled(config);
      expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
    }
  });

  it('no debería agregar Authorization header si no hay token', () => {
    vi.mocked(authStorage.getToken).mockReturnValue(null);

    const config: InternalAxiosRequestConfig = {
      headers: {} as any,
    } as InternalAxiosRequestConfig;

    const interceptors = (apiClient.interceptors.request as any).handlers;
    const lastInterceptor = interceptors[interceptors.length - 1];
    
    if (lastInterceptor && lastInterceptor.fulfilled) {
      const result = lastInterceptor.fulfilled(config);
      expect(result.headers.Authorization).toBeUndefined();
    }
  });
});

describe('apiClient - Response Interceptor', () => {
  // Mock de window.location
  const mockLocation = {
    href: '',
    pathname: '/dashboard',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    mockLocation.href = '';
    mockLocation.pathname = '/dashboard';
  });

  it('debería limpiar storage y redirigir a /login en error 401', async () => {
    const error = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    };

    const interceptors = (apiClient.interceptors.response as any).handlers;
    const lastInterceptor = interceptors[interceptors.length - 1];

    if (lastInterceptor && lastInterceptor.rejected) {
      await expect(lastInterceptor.rejected(error)).rejects.toEqual(error);
      expect(authStorage.clear).toHaveBeenCalled();
      expect(mockLocation.href).toBe('/login');
    }
  });

  it('no debería redirigir si ya está en /login', async () => {
    mockLocation.pathname = '/login';
    
    const error = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    };

    const interceptors = (apiClient.interceptors.response as any).handlers;
    const lastInterceptor = interceptors[interceptors.length - 1];

    if (lastInterceptor && lastInterceptor.rejected) {
      await expect(lastInterceptor.rejected(error)).rejects.toEqual(error);
      expect(authStorage.clear).toHaveBeenCalled();
      // No debería cambiar href porque ya está en login
      expect(mockLocation.href).toBe('');
    }
  });

  it('no debería limpiar storage en otros errores (500, 404, etc)', async () => {
    const error = {
      response: {
        status: 500,
        data: { message: 'Internal Server Error' },
      },
    };

    const interceptors = (apiClient.interceptors.response as any).handlers;
    const lastInterceptor = interceptors[interceptors.length - 1];

    if (lastInterceptor && lastInterceptor.rejected) {
      await expect(lastInterceptor.rejected(error)).rejects.toEqual(error);
      expect(authStorage.clear).not.toHaveBeenCalled();
      expect(mockLocation.href).toBe('');
    }
  });
});
