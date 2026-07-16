import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@lib/api-client';
import type {
  PlatformDto,
  CreatePlatformDto,
  UpdatePlatformDto,
} from '@excepio/shared';

export function usePlatformMutations() {
  const queryClient = useQueryClient();

  const createPlatform = useMutation({
    mutationFn: async (data: CreatePlatformDto) => {
      const response = await apiClient.post<PlatformDto>('/platforms', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
    },
  });

  const updatePlatform = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdatePlatformDto }) => {
      const response = await apiClient.patch<PlatformDto>(
        `/platforms/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
    },
  });

  const deletePlatform = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/platforms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
    },
  });

  const regenerateApiKey = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post<PlatformDto>(
        `/platforms/${id}/regenerate`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
    },
  });

  const activatePlatform = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.post<PlatformDto>(
        `/platforms/${id}/activate`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
    },
  });

  return {
    createPlatform,
    updatePlatform,
    deletePlatform,
    regenerateApiKey,
    activatePlatform,
  };
}
