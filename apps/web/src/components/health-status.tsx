'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { HealthCheckResponse } from '@excepio/shared';

export function HealthStatus() {
  const { data, isLoading, isError, error } = useQuery<HealthCheckResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await apiClient.get<HealthCheckResponse>('/health');
      return response.data;
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-lg">
        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
        <span className="text-gray-600">Conectando con la API...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="w-3 h-3 bg-red-500 rounded-full" />
        <span className="text-red-700">
          Error de conexión: {error instanceof Error ? error.message : 'Error desconocido'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="w-3 h-3 bg-green-500 rounded-full" />
      <div className="flex flex-col">
        <span className="text-green-700 font-medium">
          API conectada - Estado: {data?.status}
        </span>
        <span className="text-green-600 text-sm">
          Última verificación: {data?.timestamp ? new Date(data.timestamp).toLocaleString('es-ES') : '-'}
        </span>
      </div>
    </div>
  );
}
