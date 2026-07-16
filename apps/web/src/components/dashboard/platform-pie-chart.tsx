'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
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
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className={cn('border-input', className)}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
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
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
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
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          {t('platformTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${percent}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value, name) => {
                const item = chartData.find((d) => d.name === name);
                return [`${value} (${item?.percent ?? 0}%)`, name];
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
