import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useProjects } from '@/hooks/use-projects';
import { apiClient } from '@/lib/api-client';

vi.mock('@/lib/api-client', () => ({
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

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería retornar los proyectos correctamente', async () => {
    const mockProjects = [
      { id: 1, name: 'Web', description: 'Web app', apiKey: 'key1', active: true },
      { id: 2, name: 'Mobile', description: 'Mobile app', apiKey: 'key2', active: true },
    ];

    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockProjects });

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProjects);
    expect(apiClient.get).toHaveBeenCalledWith('/projects');
  });

  it('debería manejar errores correctamente', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('debería estar en estado loading inicialmente', () => {
    vi.mocked(apiClient.get).mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });
});
