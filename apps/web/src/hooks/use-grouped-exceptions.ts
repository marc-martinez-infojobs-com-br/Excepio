'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@lib/api-client';
import type {
  GroupedExceptionsFilterDto,
  GroupedExceptionsResponseDto,
} from '@excepio/shared';

/**
 * Hook para obtener excepciones agrupadas por mensaje.
 * 
 * @param filters - Filtros opcionales (startDate, endDate, platformId, levelId, page, limit)
 * @returns Query result con data, isLoading, isError, etc.
 */
export function useGroupedExceptions(filters?: GroupedExceptionsFilterDto) {
  // Eliminar valores undefined del objeto de filtros
  const cleanFilters = filters
    ? Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined)
      )
    : {};

  return useQuery<GroupedExceptionsResponseDto>({
    queryKey: ['stats', 'grouped-by-message', cleanFilters],
    queryFn: async () => {
      const response = await apiClient.get<GroupedExceptionsResponseDto>(
        '/stats/grouped-by-message',
        {
          params: cleanFilters,
        }
      );
      return response.data;
    },
  });
}
