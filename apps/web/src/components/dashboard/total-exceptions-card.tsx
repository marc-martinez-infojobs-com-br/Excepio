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

// Colores y nombres por nivel (consistentes con el resto del dashboard)
const LEVEL_CONFIG: Record<string, { color: string; name: string }> = {
  '5': { color: '#f43f5e', name: 'Critical' },
  '4': { color: '#ef4444', name: 'Error' },
  '3': { color: '#f59e0b', name: 'Warning' },
  '2': { color: '#3b82f6', name: 'Info' },
  '1': { color: '#6b7280', name: 'Debug' },
};

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

  // Ordenar niveles de mayor a menor criticidad (5, 4, 3, 2, 1)
  const levelIds = Object.keys(current.byLevel || {}).sort((a, b) => parseInt(b) - parseInt(a));

  // Componente de cambio porcentual reutilizable
  const ChangeIndicator = ({ showText = false }: { showText?: boolean }) => (
    <div className="flex items-center gap-1">
      {isPositive && (
        <>
          <TrendingUp className="h-4 w-4 text-rose-500" />
          <span className="text-xs text-rose-500">
            +{changePercent}%{showText && ` ${t('vsPrevPeriod')}`}
          </span>
        </>
      )}
      {isNegative && (
        <>
          <TrendingDown className="h-4 w-4 text-emerald-500" />
          <span className="text-xs text-emerald-500">
            {changePercent}%{showText && ` ${t('vsPrevPeriod')}`}
          </span>
        </>
      )}
      {isNeutral && (
        <>
          <Minus className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {showText ? t('noChange') : '0%'}
          </span>
        </>
      )}
    </div>
  );

  // Componente de desglose por nivel reutilizable
  const LevelBreakdown = () => (
    <>
      {levelIds.map((levelId) => {
        const config = LEVEL_CONFIG[levelId];
        const count = current.byLevel?.[levelId] || 0;
        return (
          <div key={levelId} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-sm"
                style={{ backgroundColor: config?.color || '#888' }}
              />
              <span className="text-muted-foreground">
                {config?.name || `Level ${levelId}`}
              </span>
            </div>
            <span className="font-medium">{formatNumber(count)}</span>
          </div>
        );
      })}
    </>
  );

  return (
    <Card className={cn('border-input', className)}>
      <CardContent className="p-6">
        {/* Desktop: layout vertical */}
        <div className="hidden lg:block">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            {t('title')}
          </p>
          <p className="text-4xl font-bold mt-2">
            {formatNumber(current.total)}
          </p>
          <div className="mt-2">
            <ChangeIndicator showText />
          </div>
          {levelIds.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border space-y-1.5">
              <LevelBreakdown />
            </div>
          )}
        </div>

        {/* Móvil: layout horizontal (2 columnas) */}
        <div className="flex lg:hidden justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {t('title')}
            </p>
            <p className="text-4xl font-bold mt-2">
              {formatNumber(current.total)}
            </p>
            <div className="mt-2">
              <ChangeIndicator />
            </div>
          </div>
          {levelIds.length > 0 && (
            <div className="space-y-1.5">
              <LevelBreakdown />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
