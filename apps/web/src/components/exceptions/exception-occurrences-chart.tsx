'use client';

import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { OccurrenceByDayDto } from '@excepio/shared';

interface ExceptionOccurrencesChartProps {
  occurrencesByDay: OccurrenceByDayDto[] | undefined;
  totalOccurrences: number | undefined;
}

export function ExceptionOccurrencesChart({
  occurrencesByDay,
  totalOccurrences,
}: ExceptionOccurrencesChartProps) {
  const t = useTranslations('exceptions.detail');
  const { resolvedTheme } = useTheme();

  const data = occurrencesByDay || [];
  const total = totalOccurrences || 0;

  // Formatear fecha para mostrar solo día/mes
  const formattedData = data.map((item) => {
    const date = new Date(item.date);
    return {
      ...item,
      label: `${date.getDate()}/${date.getMonth() + 1}`,
    };
  });

  const containerClass = resolvedTheme === 'dark'
    ? 'border border-input rounded-lg p-4 bg-zinc-800'
    : 'border border-input rounded-lg p-4';

  const barColor = resolvedTheme === 'dark' ? '#adc6ff' : '#3b82f6';
  const gridColor = resolvedTheme === 'dark' ? '#44474e' : '#e5e7eb';
  const textColor = resolvedTheme === 'dark' ? '#c4c6d0' : '#44474e';

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">
        {t('occurrences.chartTitle')}
      </h2>

      <div className={containerClass}>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 12, fill: textColor }} 
                axisLine={{ stroke: gridColor }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: textColor }} 
                axisLine={{ stroke: gridColor }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: resolvedTheme === 'dark' ? '#27272a' : '#ffffff',
                  border: `1px solid ${gridColor}`,
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: textColor }}
              />
              <Bar 
                dataKey="count" 
                fill={barColor} 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-3">
          {t('occurrences.total', { count: total })}
        </p>
      </div>
    </div>
  );
}
