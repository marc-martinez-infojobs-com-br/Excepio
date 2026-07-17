'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@lib/api-client';
import type { ExceptionDetailDto } from '@excepio/shared';

/**
 * Hook para obtener el detalle de una excepción por su ID.
 *
 * @param id - ID de la excepción (opcional)
 * @returns Query result con data, isLoading, isError, etc.
 */
export function useExceptionDetail(id: string | undefined) {
  return useQuery<ExceptionDetailDto>({
    queryKey: ['exception', id],
    queryFn: async () => {
      const response = await apiClient.get<ExceptionDetailDto>(
        `/exceptions/${id}`
      );
      return response.data;
    },
    enabled: Boolean(id && id.length > 0),
  });
}
