import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useExceptions } from '@/hooks/use-exceptions';
import { apiClient } from '@/lib/api-client';
import type { ExceptionListResponseDto } from '@excepio/shared';
import type { ReactNode } from 'react';

// Mock del cliente API
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const mockApiClient = vi.mocked(apiClient);

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const createWrapper = () => {
  const testQueryClient = createTestQueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={testQueryClient}>{children}</QueryClientProvider>
  );
};

const mockExceptionsResponse: ExceptionListResponseDto = {
  data: [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      projectId: 1,
      levelId: 4,
      message: 'Test error message',
      stackTrace: 'at test.js:1',
      userId: 'user_001',
      url: '/api/test',
      userAgent: 'Mozilla/5.0',
      appVersion: '1.0.0',
      metadata: { key: 'value' },
      createdAt: '2024-01-15T10:30:00.000Z',
    },
  ],
  total: 1,
  page: 1,
  limit: 50,
};

describe('useExceptions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería llamar a la API sin filtros por defecto', async () => {
    mockApiClient.get.mockResolvedValueOnce({ data: mockExceptionsResponse });

    const { result } = renderHook(() => useExceptions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient.get).toHaveBeenCalledWith('/exceptions', {
      params: {},
    });
    expect(result.current.data).toEqual(mockExceptionsResponse);
  });

  it('debería pasar filtros a la API correctamente', async () => {
    mockApiClient.get.mockResolvedValueOnce({ data: mockExceptionsResponse });

    const filters = {
      projectId: 1,
      levelId: 4,
      page: 2,
      limit: 25,
    };

    const { result } = renderHook(() => useExceptions(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient.get).toHaveBeenCalledWith('/exceptions', {
      params: filters,
    });
  });

  it('debería manejar filtros de búsqueda de texto', async () => {
    mockApiClient.get.mockResolvedValueOnce({ data: mockExceptionsResponse });

    const filters = {
      messageSearch: 'error',
      userId: 'user_001',
    };

    const { result } = renderHook(() => useExceptions(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient.get).toHaveBeenCalledWith('/exceptions', {
      params: filters,
    });
  });

  it('debería manejar filtros de rango de fechas', async () => {
    mockApiClient.get.mockResolvedValueOnce({ data: mockExceptionsResponse });

    const filters = {
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-01-31T23:59:59.000Z',
    };

    const { result } = renderHook(() => useExceptions(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient.get).toHaveBeenCalledWith('/exceptions', {
      params: filters,
    });
  });

  it('debería estar en estado loading inicialmente', () => {
    mockApiClient.get.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useExceptions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('debería manejar errores de la API', async () => {
    const error = new Error('Network error');
    mockApiClient.get.mockRejectedValueOnce(error);

    const { result } = renderHook(() => useExceptions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('debería omitir filtros con valores undefined', async () => {
    mockApiClient.get.mockResolvedValueOnce({ data: mockExceptionsResponse });

    const filters = {
      projectId: 1,
      levelId: undefined,
      messageSearch: undefined,
    };

    const { result } = renderHook(() => useExceptions(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Solo debería enviar projectId, no los undefined
    expect(mockApiClient.get).toHaveBeenCalledWith('/exceptions', {
      params: { projectId: 1 },
    });
  });
});
