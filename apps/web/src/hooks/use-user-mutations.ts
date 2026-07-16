import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@lib/api-client';
import type {
  UserResponseDto,
  CreateUserDto,
  UpdateUserDto,
} from '@excepio/shared';

export function useUserMutations() {
  const queryClient = useQueryClient();

  const createUser = useMutation({
    mutationFn: async (data: CreateUserDto) => {
      const response = await apiClient.post<UserResponseDto>('/users', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserDto }) => {
      const response = await apiClient.patch<UserResponseDto>(
        `/users/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const activateUser = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<UserResponseDto>(
        `/users/${id}/activate`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    createUser,
    updateUser,
    deleteUser,
    activateUser,
  };
}
