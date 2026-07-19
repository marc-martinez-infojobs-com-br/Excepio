'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@lib/api-client';
import type { HealthCheckResponse } from '@excepio/shared';
import { useTranslations } from 'next-intl';

interface HealthStatusProps {
  compact?: boolean;
}

export function HealthStatus({ compact = false }: HealthStatusProps) {
  const t = useTranslations('health');
  const tCommon = useTranslations('common');

  const { data, isLoading, isError, error } = useQuery<HealthCheckResponse>({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await apiClient.get<HealthCheckResponse>('/health');
      return response.data;
    },
    retry: true,
    retryDelay: (attemptIndex) => Math.min(2000 * (attemptIndex + 1), 10000),
    refetchInterval: (query) => {
      // Si está conectado, refrescar cada 30s
      if (query.state.data?.status === 'ok') {
        return 30000;
      }
      // Si está en error o cargando, intentar cada 3s para despertar Render
      return 3000;
    },
  });

  const isConnected = data?.status === 'ok';

  // Modo compacto para el footer de auth
  if (compact) {
    if (isLoading || isError || !isConnected) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[11px] uppercase text-muted-foreground tracking-wider font-semibold">
          <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
          {t('awakening')}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] uppercase text-green-600 dark:text-green-400 tracking-wider font-semibold">
        <span className="w-2 h-2 bg-green-500 rounded-full" />
        {t('ready')}
      </span>
    );
  }

  // Modo normal (card)
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-100 rounded-lg">
        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
        <span className="text-gray-600">{t('connecting')}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="w-3 h-3 bg-red-500 rounded-full" />
        <span className="text-red-700">
          {t('connectionError')} {error instanceof Error ? error.message : tCommon('unknownError')}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="w-3 h-3 bg-green-500 rounded-full" />
      <div className="flex flex-col">
        <span className="text-green-700 font-medium">
          {t('connected')} {data?.status}
        </span>
        <span className="text-green-600 text-sm">
          {t('lastCheck')} {data?.timestamp ? new Date(data.timestamp).toLocaleString() : '-'}
        </span>
      </div>
    </div>
  );
}
