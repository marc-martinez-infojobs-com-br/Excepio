'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';
import { useTimeStats } from '@hooks/use-time-stats';
import type { TimeStatsFilterDto } from '@excepio/shared';
import { cn } from '@lib/utils';

interface TimeSeriesChartProps {
  filters?: TimeStatsFilterDto;
  className?: string;
}

// Colores por nivel de severidad (levelId)
// Consistentes con los badges del listado de excepciones
// 1: Debug, 2: Info, 3: Warning, 4: Error, 5: Critical
const LEVEL_COLORS: Record<string, string> = {
  '1': '#6b7280', // Debug - gray-500
  '2': '#3b82f6', // Info - blue-500
  '3': '#f59e0b', // Warning - amber-500
  '4': '#ef4444', // Error - red-500
  '5': '#f43f5e', // Critical - rose-500
};

const LEVEL_NAMES: Record<string, string> = {
  '1': 'Debug',
  '2': 'Info',
  '3': 'Warning',
  '4': 'Error',
  '5': 'Critical',
};

/**
 * Formatea una fecha ISO a formato legible según granularidad
 */
function formatDate(dateStr: string, granularity: 'hour' | 'day' | 'week' | 'month'): string {
  const date = new Date(dateStr);
  switch (granularity) {
    case 'hour':
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    case 'day':
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    case 'week':
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    case 'month':
      return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
    default:
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

/**
 * Gráfico de área apilada que muestra excepciones por tiempo y nivel de severidad.
 */
export function TimeSeriesChart({ filters, className }: TimeSeriesChartProps) {
  const t = useTranslations('dashboard.stats');
  const { data, isLoading, isError } = useTimeStats(filters);

  // Transformar datos para Recharts y obtener los levels presentes
  const { chartData, levelIds } = useMemo(() => {
    if (!data?.data) return { chartData: [], levelIds: [] };

    // Encontrar todos los levelIds únicos presentes en los datos
    const uniqueLevelIds = new Set<string>();
    data.data.forEach((point) => {
      Object.keys(point.levels).forEach((levelId) => {
        uniqueLevelIds.add(levelId);
      });
    });

    // Ordenar levelIds numéricamente (1, 2, 3, 4, 5)
    const sortedLevelIds = Array.from(uniqueLevelIds).sort(
      (a, b) => parseInt(a) - parseInt(b)
    );

    // Transformar datos al formato de Recharts
    const transformed = data.data.map((point) => {
      const result: Record<string, string | number> = {
        date: formatDate(point.date, data.granularity),
        fullDate: point.date,
        total: point.total,
      };

      // Añadir cada nivel como campo separado
      sortedLevelIds.forEach((levelId) => {
        result[`level_${levelId}`] = point.levels[levelId] || 0;
      });

      return result;
    });

    return { chartData: transformed, levelIds: sortedLevelIds };
  }, [data]);

  if (isLoading) {
    return (
      <Card className={cn('border-input', className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[180px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className={cn('border-input', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            {t('timeSeriesTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">{t('error')}</p>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card className={cn('border-input', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            {t('timeSeriesTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('noData')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('border-input', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            {t('timeSeriesTitle')}
          </CardTitle>
          {/* Leyenda de colores inline - de mayor a menor criticidad */}
          <div className="flex items-center gap-3">
            {[...levelIds].reverse().map((levelId) => (
              <div key={levelId} className="flex items-center gap-1">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: LEVEL_COLORS[levelId] || '#888888' }}
                />
                <span className="text-xs text-muted-foreground">
                  {LEVEL_NAMES[levelId] || `Level ${levelId}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="outline-none" tabIndex={-1}>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: 'currentColor', fontSize: 10 }}
              tickLine={{ stroke: 'currentColor' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'currentColor', fontSize: 10 }}
              tickLine={{ stroke: 'currentColor' }}
              allowDecimals={false}
              width={30}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'var(--color-foreground)' }}
              itemSorter={(item) => -(parseInt(String(item.dataKey).replace('level_', '')) || 0)}
            />
            {/* Renderizar áreas en orden inverso para que los críticos queden arriba */}
            {[...levelIds].reverse().map((levelId) => (
              <Area
                key={levelId}
                type="monotone"
                dataKey={`level_${levelId}`}
                name={LEVEL_NAMES[levelId] || `Level ${levelId}`}
                stackId="1"
                stroke={LEVEL_COLORS[levelId] || '#888888'}
                fill={LEVEL_COLORS[levelId] || '#888888'}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
