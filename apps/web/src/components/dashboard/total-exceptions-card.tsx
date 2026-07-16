'use client';

import { useTranslations } from 'next-intl';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';
import { useTotalStats } from '@hooks/use-total-stats';
import type { StatsFilterDto } from '@excepio/shared';
import { cn } from '@lib/utils';

interface TotalExceptionsCardProps {
  filters?: StatsFilterDto;
  className?: string;
}

/**
 * Formatea un número grande a formato legible (ej: 142900 -> 142.9k)
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

/**
 * Card que muestra el total de excepciones con comparación al período anterior.
 */
export function TotalExceptionsCard({ filters, className }: TotalExceptionsCardProps) {
  const t = useTranslations('dashboard.stats');
  const { data, isLoading, isError } = useTotalStats(filters);

  if (isLoading) {
    return (
      <Card className={cn('border-input', className)}>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-10 w-32 mb-2" />
          <Skeleton className="h-4 w-36" />
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className={cn('border-input', className)}>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">{t('title')}</p>
          <p className="text-destructive text-sm mt-2">{t('error')}</p>
        </CardContent>
      </Card>
    );
  }

  const { current, changePercent } = data;
  const isPositive = changePercent > 0;
  const isNegative = changePercent < 0;
  const isNeutral = changePercent === 0;

  return (
    <Card className={cn('border-input', className)}>
      <CardContent className="p-6">
        {/* Label */}
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {t('title')}
        </p>

        {/* Total */}
        <p className="text-4xl font-bold mt-2">
          {formatNumber(current.total)}
        </p>

        {/* Cambio porcentual */}
        <div className="flex items-center gap-1 mt-2">
          {isPositive && (
            <>
              <TrendingUp className="h-4 w-4 text-rose-500" />
              <span className="text-sm text-rose-500">
                +{changePercent}% {t('vsPrevPeriod')}
              </span>
            </>
          )}
          {isNegative && (
            <>
              <TrendingDown className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-emerald-500">
                {changePercent}% {t('vsPrevPeriod')}
              </span>
            </>
          )}
          {isNeutral && (
            <>
              <Minus className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {t('noChange')}
              </span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
