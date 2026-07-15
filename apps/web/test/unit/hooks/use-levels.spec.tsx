import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useLevels } from '@hooks/use-levels';
import { apiClient } from '@lib/api-client';

vi.mock('@lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useLevels', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería retornar los niveles correctamente', async () => {
    const mockLevels = [
      { id: 1, name: 'DEBUG', description: 'Debug level' },
      { id: 2, name: 'INFO', description: 'Info level' },
      { id: 3, name: 'WARNING', description: 'Warning level' },
      { id: 4, name: 'ERROR', description: 'Error level' },
      { id: 5, name: 'FATAL', description: 'Fatal level' },
    ];

    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockLevels });

    const { result } = renderHook(() => useLevels(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockLevels);
    expect(apiClient.get).toHaveBeenCalledWith('/levels');
  });

  it('debería manejar errores correctamente', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useLevels(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('debería estar en estado loading inicialmente', () => {
    vi.mocked(apiClient.get).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useLevels(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
