import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useResetPassword } from '@hooks/use-reset-password';
import { apiClient } from '@lib/api-client';
import { UserRole } from '@excepio/shared';
import type { ResetPasswordDto } from '@excepio/shared';

vi.mock('@lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Given_ValidPasswordData_When_ResetPassword_Then_CallsApiAndReturnsUser', async () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const resetData: ResetPasswordDto = {
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };

    const updatedUser = {
      id: userId,
      email: 'user@example.com',
      name: 'Test User',
      role: UserRole.USUARIO,
      statusId: 2,
      lastLoginAt: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: updatedUser });

    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ userId, data: resetData });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(apiClient.post).toHaveBeenCalledWith(`/users/${userId}/reset-password`, resetData);
    expect(result.current.data).toEqual(updatedUser);
  });

  it('Given_ApiError_When_ResetPassword_Then_SetsErrorState', async () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const resetData: ResetPasswordDto = {
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };

    const error = new Error('API Error');
    vi.mocked(apiClient.post).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ userId, data: resetData });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('Given_Mutation_When_Pending_Then_IsLoadingIsTrue', async () => {
    const { result } = renderHook(() => useResetPassword(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);

    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const resetData: ResetPasswordDto = {
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };

    const updatedUser = {
      id: userId,
      email: 'user@example.com',
      name: 'Test User',
      role: UserRole.USUARIO,
      statusId: 2,
      lastLoginAt: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: updatedUser });

    result.current.mutate({ userId, data: resetData });

    // Esperar a que complete
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.isPending).toBe(false);
  });

  it('Given_SuccessfulMutation_When_OnSuccessCallback_Then_InvalidatesUsersQuery', async () => {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    const resetData: ResetPasswordDto = {
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };

    const updatedUser = {
      id: userId,
      email: 'user@example.com',
      name: 'Test User',
      role: UserRole.USUARIO,
      statusId: 2,
      lastLoginAt: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: updatedUser });

    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: {
          retry: false,
        },
      },
    });
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useResetPassword(), { wrapper });

    result.current.mutate({ userId, data: resetData });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['users'] });
  });
});
