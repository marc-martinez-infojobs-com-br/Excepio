import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import type { ExceptionDetailDto } from '@excepio/shared';

// Mock de api-client
const mockGet = vi.fn();
vi.mock('@lib/api-client', () => ({
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
  },
}));

// Import después del mock
import { useExceptionDetail } from '@hooks/use-exception-detail';

// Wrapper con QueryClientProvider para los tests
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

const mockExceptionDetail: ExceptionDetailDto = {
  id: 'exc-123',
  message: 'TypeError: Cannot read property of undefined',
  stackTrace: 'Error at line 42\n  at Object.method (file.ts:42:10)',
  levelId: 3,
  levelName: 'ERROR',
  platformId: 1,
  platformName: 'Web App',
  platformIcon: 'LuGlobe',
  url: 'https://example.com/page',
  userId: 'user-456',
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  appVersion: '1.2.3',
  metadata: { browser: 'Chrome', os: 'macOS' },
  timestamp: '2024-01-15T10:30:00.000Z',
  affectedUsersCount: 5,
};

describe('useExceptionDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('cuando se proporciona un ID válido', () => {
    it('debería hacer fetch del detalle de excepción', async () => {
      mockGet.mockResolvedValueOnce({ data: mockExceptionDetail });

      const { result } = renderHook(() => useExceptionDetail('exc-123'), {
        wrapper: createWrapper(),
      });

      // Inicialmente está cargando
      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockGet).toHaveBeenCalledWith('/exceptions/exc-123');
      expect(result.current.data).toEqual(mockExceptionDetail);
      expect(result.current.isError).toBe(false);
    });

    it('debería retornar los datos completos incluyendo affectedUsersCount', async () => {
      mockGet.mockResolvedValueOnce({ data: mockExceptionDetail });

      const { result } = renderHook(() => useExceptionDetail('exc-123'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.affectedUsersCount).toBe(5);
      expect(result.current.data?.message).toBe('TypeError: Cannot read property of undefined');
      expect(result.current.data?.stackTrace).toContain('Error at line 42');
      expect(result.current.data?.metadata).toEqual({ browser: 'Chrome', os: 'macOS' });
    });
  });

  describe('cuando hay un error', () => {
    it('debería manejar errores de la API', async () => {
      mockGet.mockRejectedValueOnce(new Error('Not found'));

      const { result } = renderHook(() => useExceptionDetail('invalid-id'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.data).toBeUndefined();
    });
  });

  describe('cuando no se proporciona ID', () => {
    it('debería deshabilitar la query si el ID es undefined', () => {
      const { result } = renderHook(() => useExceptionDetail(undefined), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetching).toBe(false);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it('debería deshabilitar la query si el ID es string vacío', () => {
      const { result } = renderHook(() => useExceptionDetail(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetching).toBe(false);
      expect(mockGet).not.toHaveBeenCalled();
    });
  });
});
