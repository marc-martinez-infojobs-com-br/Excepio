import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@lib/api-client';
import type { PlatformDto } from '@excepio/shared';

export function usePlatforms() {
  return useQuery<PlatformDto[]>({
    queryKey: ['platforms'],
    queryFn: async () => {
      const response = await apiClient.get<PlatformDto[]>('/platforms');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos - las platforms raramente cambian
  });
}
