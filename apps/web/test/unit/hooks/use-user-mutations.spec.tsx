import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useUserMutations } from '@hooks/use-user-mutations';
import { apiClient } from '@lib/api-client';
import { UserRole } from '@excepio/shared';
import type { CreateUserDto, UpdateUserDto } from '@excepio/shared';

vi.mock('@lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
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

describe('useUserMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('debería crear un usuario correctamente', async () => {
      const newUser: CreateUserDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        name: 'New User',
        role: UserRole.USUARIO,
      };

      const createdUser = {
        id: '3',
        email: 'newuser@example.com',
        name: 'New User',
        role: UserRole.USUARIO,
        statusId: 2,
        lastLoginAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: createdUser });

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      result.current.createUser.mutate(newUser);

      await waitFor(() => {
        expect(result.current.createUser.isSuccess).toBe(true);
      });

      expect(apiClient.post).toHaveBeenCalledWith('/users', newUser);
      expect(result.current.createUser.data).toEqual(createdUser);
    });
  });

  describe('updateUser', () => {
    it('debería actualizar un usuario correctamente', async () => {
      const userId = '1';
      const updateData: UpdateUserDto = {
        name: 'Updated Name',
        role: UserRole.ADMINISTRADOR,
      };

      const updatedUser = {
        id: userId,
        email: 'user@example.com',
        name: 'Updated Name',
        role: UserRole.ADMINISTRADOR,
        statusId: 2,
        lastLoginAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: updatedUser });

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      result.current.updateUser.mutate({ id: userId, data: updateData });

      await waitFor(() => {
        expect(result.current.updateUser.isSuccess).toBe(true);
      });

      expect(apiClient.patch).toHaveBeenCalledWith(`/users/${userId}`, updateData);
      expect(result.current.updateUser.data).toEqual(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('debería eliminar un usuario correctamente', async () => {
      const userId = '1';

      vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: {} });

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      result.current.deleteUser.mutate(userId);

      await waitFor(() => {
        expect(result.current.deleteUser.isSuccess).toBe(true);
      });

      expect(apiClient.delete).toHaveBeenCalledWith(`/users/${userId}`);
    });
  });

  describe('activateUser', () => {
    it('debería activar un usuario correctamente', async () => {
      const userId = '1';

      const activatedUser = {
        id: userId,
        email: 'user@example.com',
        name: 'User',
        role: UserRole.USUARIO,
        statusId: 2,
        lastLoginAt: null,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: activatedUser });

      const { result } = renderHook(() => useUserMutations(), {
        wrapper: createWrapper(),
      });

      result.current.activateUser.mutate(userId);

      await waitFor(() => {
        expect(result.current.activateUser.isSuccess).toBe(true);
      });

      expect(apiClient.post).toHaveBeenCalledWith(`/users/${userId}/activate`);
      expect(result.current.activateUser.data).toEqual(activatedUser);
    });
  });
});
