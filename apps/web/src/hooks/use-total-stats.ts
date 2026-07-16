'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@lib/api-client';
import type { StatsFilterDto, TotalStatsResponseDto } from '@excepio/shared';

/**
 * Hook para obtener el total de excepciones con comparación al período anterior.
 * 
 * @param filters - Filtros opcionales (startDate, endDate, platformId)
 * @returns Query result con data, isLoading, isError, etc.
 */
export function useTotalStats(filters?: StatsFilterDto) {
  // Eliminar valores undefined del objeto de filtros
  const cleanFilters = filters
    ? Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined)
      )
    : {};

  return useQuery<TotalStatsResponseDto>({
    queryKey: ['stats', 'total', cleanFilters],
    queryFn: async () => {
      const response = await apiClient.get<TotalStatsResponseDto>('/stats/total', {
        params: cleanFilters,
      });
      return response.data;
    },
  });
}
