'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@lib/api-client';
import type { ExceptionFilterDto, ExceptionListResponseDto } from '@excepio/shared';

/**
 * Hook para obtener el listado de excepciones con filtros y paginación.
 * 
 * @param filters - Filtros opcionales (platformId, levelId, fechas, búsquedas, paginación)
 * @returns Query result con data, isLoading, isError, etc.
 */
export function useExceptions(filters?: ExceptionFilterDto) {
  // Eliminar valores undefined del objeto de filtros
  const cleanFilters = filters
    ? Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined)
      )
    : {};

  return useQuery<ExceptionListResponseDto>({
    queryKey: ['exceptions', cleanFilters],
    queryFn: async () => {
      const response = await apiClient.get<ExceptionListResponseDto>('/exceptions', {
        params: cleanFilters,
      });
      return response.data;
    },
  });
}
