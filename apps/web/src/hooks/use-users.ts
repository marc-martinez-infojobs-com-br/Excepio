import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@lib/api-client';
import type { UserResponseDto } from '@excepio/shared';

export function useUsers() {
  return useQuery<UserResponseDto[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get<UserResponseDto[]>('/users');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos - los usuarios raramente cambian
  });
}
