'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@lib/api-client';
import type { StatsFilterDto, PlatformStatsResponseDto } from '@excepio/shared';

/**
 * Hook para obtener la distribución de excepciones por plataforma.
 * 
 * @param filters - Filtros opcionales (startDate, endDate)
 * @returns Query result con data, isLoading, isError, etc.
 */
export function usePlatformStats(filters?: StatsFilterDto) {
  // Eliminar valores undefined del objeto de filtros
  const cleanFilters = filters
    ? Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined)
      )
    : {};

  return useQuery<PlatformStatsResponseDto>({
    queryKey: ['stats', 'by-platform', cleanFilters],
    queryFn: async () => {
      const response = await apiClient.get<PlatformStatsResponseDto>('/stats/by-platform', {
        params: cleanFilters,
      });
      return response.data;
    },
  });
}
