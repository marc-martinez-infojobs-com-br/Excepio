'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';
import { usePlatformStats } from '@hooks/use-platform-stats';
import type { StatsFilterDto } from '@excepio/shared';
import { cn } from '@lib/utils';

interface PlatformPieChartProps {
  filters?: StatsFilterDto;
  className?: string;
}

// Paleta de colores para las plataformas
const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
];

/**
 * Gráfico de pastel que muestra la distribución de excepciones por plataforma.
 */
export function PlatformPieChart({ filters, className }: PlatformPieChartProps) {
  const t = useTranslations('dashboard.stats');
  const { data, isLoading, isError } = usePlatformStats(filters);

  // Transformar datos para Recharts
  const chartData = useMemo(() => {
    if (!data?.data) return [];

    return data.data.map((point, index) => ({
      name: point.platformName,
      value: point.count,
      percent: point.percent,
      color: COLORS[index % COLORS.length],
    }));
  }, [data]);

  if (isLoading) {
    return (
      <Card className={cn('border-input', className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className={cn('border-input', className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            {t('platformTitle')}
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
            {t('platformTitle')}
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
        <CardTitle className="text-base font-semibold">
          {t('platformTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          {/* Pie Chart */}
          <div className="outline-none" tabIndex={-1}>
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={55}
                  innerRadius={30}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leyenda en 2 columnas */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 w-full">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate text-muted-foreground text-xs">
                  {item.name}
                </span>
                <span className="font-medium text-xs ml-auto">{item.percent}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
