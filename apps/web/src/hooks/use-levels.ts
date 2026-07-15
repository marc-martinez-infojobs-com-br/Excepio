import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { LevelResponseDto } from '@excepio/shared';

export function useLevels() {
  return useQuery<LevelResponseDto[]>({
    queryKey: ['levels'],
    queryFn: async () => {
      const response = await apiClient.get<LevelResponseDto[]>('/levels');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos - los levels raramente cambian
  });
}
