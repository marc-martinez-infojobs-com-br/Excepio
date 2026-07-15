import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ProjectDto } from '@excepio/shared';

export function useProjects() {
  return useQuery<ProjectDto[]>({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await apiClient.get<ProjectDto[]>('/projects');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos - los projects raramente cambian
  });
}
