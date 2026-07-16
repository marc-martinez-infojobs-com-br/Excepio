'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@lib/api-client';
import type { TimeStatsFilterDto, TimeStatsResponseDto } from '@excepio/shared';

/**
 * Hook para obtener excepciones agrupadas por tiempo y nivel de severidad.
 * 
 * @param filters - Filtros opcionales (startDate, endDate, platformId, levelId, granularity)
 * @returns Query result con data, isLoading, isError, etc.
 */
export function useTimeStats(filters?: TimeStatsFilterDto) {
  // Eliminar valores undefined del objeto de filtros
  const cleanFilters = filters
    ? Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined)
      )
    : {};

  return useQuery<TimeStatsResponseDto>({
    queryKey: ['stats', 'by-time', cleanFilters],
    queryFn: async () => {
      const response = await apiClient.get<TimeStatsResponseDto>('/stats/by-time', {
        params: cleanFilters,
      });
      return response.data;
    },
  });
}
