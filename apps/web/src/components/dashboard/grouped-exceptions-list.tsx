'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/card';
import { Skeleton } from '@components/ui/skeleton';
import { PlatformIcon } from '@components/platforms/platform-icon';
import { useGroupedExceptions } from '@hooks/use-grouped-exceptions';
import { useLevels } from '@hooks/use-levels';
import { usePlatforms } from '@hooks/use-platforms';
import type { GroupedExceptionsFilterDto } from '@excepio/shared';
import { cn } from '@lib/utils';

interface GroupedExceptionsListProps {
  filters?: GroupedExceptionsFilterDto;
  className?: string;
}

/**
 * Retorna las clases CSS para el badge según el nivel de severidad
 */
function getLevelBadgeClasses(levelId: number): string {
  switch (levelId) {
    case 1: // DEBUG
      return 'bg-gray-500/10 text-gray-600 border-gray-500/30 dark:bg-gray-400/20 dark:text-gray-300 dark:border-gray-400/30';
    case 2: // INFO
      return 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:bg-blue-400/20 dark:text-blue-400 dark:border-blue-400/30';
    case 3: // WARNING
      return 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-400/20 dark:text-amber-400 dark:border-amber-400/30';
    case 4: // ERROR
      return 'bg-red-500/10 text-red-600 border-red-500/30 dark:bg-red-400/20 dark:text-red-400 dark:border-red-400/30';
    case 5: // FATAL / CRITICAL
      return 'bg-rose-500/15 text-rose-700 border-rose-500/40 dark:bg-rose-400/25 dark:text-rose-400 dark:border-rose-400/40';
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/30 dark:bg-gray-400/20 dark:text-gray-300 dark:border-gray-400/30';
  }
}

/**
 * Retorna el nombre del badge para mostrar (FATAL -> CRITICAL)
 */
function getLevelDisplayName(levelId: number, levelName: string): string {
  if (levelId === 5) return 'CRITICAL';
  return levelName;
}

/**
 * Formatea una fecha ISO a formato absoluto
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Calcula el tiempo relativo (solo en cliente)
 */
function getRelativeTime(
  isoDate: string,
  t: (key: string, values?: Record<string, number>) => string
): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return t('justNow');
  } else if (diffMins < 60) {
    return t('minutesAgo', { count: diffMins });
  } else if (diffHours < 24) {
    return t('hoursAgo', { count: diffHours });
  } else if (diffDays < 7) {
    return t('daysAgo', { count: diffDays });
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Lista de excepciones agrupadas con el mismo diseño que el listado de issues.
 */
export function GroupedExceptionsList({
  filters,
  className,
}: GroupedExceptionsListProps) {
  const t = useTranslations('dashboard.stats');
  const tExceptions = useTranslations('exceptions');
  const tTime = useTranslations('exceptions.time');
  const { data, isLoading, isError } = useGroupedExceptions(filters);
  const { data: levelsData } = useLevels();
  const { data: platformsData } = usePlatforms();

  const levels = levelsData ?? [];
  const platforms = platformsData ?? [];

  // Estado para tiempos relativos (evitar hydration mismatch)
  const [relativeTimes, setRelativeTimes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data?.data) {
      const times: Record<string, string> = {};
      data.data.forEach((item, index) => {
        times[index] = getRelativeTime(item.lastSeen, tTime);
      });
      setRelativeTimes(times);
    }
  }, [data, tTime]);

  if (isLoading) {
    return (
      <Card className={cn('border-input', className)}>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className={cn('border-input', className)}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {t('groupedTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive text-sm">{t('error')}</p>
        </CardContent>
      </Card>
    );
  }

  if (data.data.length === 0) {
    return (
      <Card className={cn('border-input', className)}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {t('groupedTitle')}
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
      {/* Desktop header: sin fondo, link a la derecha */}
      <CardHeader className="hidden md:flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          {t('groupedTitle')}
        </CardTitle>
        <a
          href="/issues"
          className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 uppercase tracking-wide"
        >
          {t('viewAllIssues')}
        </a>
      </CardHeader>

      {/* Móvil header: con fondo, link debajo */}
      <CardHeader className="md:hidden bg-muted/50">
        <CardTitle className="text-lg font-semibold">
          {t('groupedTitle')}
        </CardTitle>
        <a
          href="/issues"
          className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 uppercase tracking-wide"
        >
          {t('viewAllIssues')}
        </a>
      </CardHeader>

      <CardContent className="p-0">
        {/* Vista desktop: tabla */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-[120px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {tExceptions('table.severity')}
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {tExceptions('table.issue')}
                </TableHead>
                <TableHead className="w-[100px] text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                  {t('count')}
                </TableHead>
                <TableHead className="w-[80px] text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                  {tExceptions('table.platform')}
                </TableHead>
                <TableHead className="w-[160px] text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {tExceptions('table.lastSeen')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((item, index) => {
                const level = levels.find((l) => l.id === item.levelId);
                const platform = platforms.find((p) => p.id === item.platformId);
                const absolute = formatDate(item.lastSeen);
                const relative = relativeTimes[index] || absolute;

                return (
                  <TableRow
                    key={`${item.message}-${item.levelId}-${item.platformId}-${index}`}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    {/* Severity Badge */}
                    <TableCell className="w-[120px] py-4">
                      <span
                        className={cn(
                          'inline-flex items-center rounded px-2 py-1 text-xs font-semibold border',
                          getLevelBadgeClasses(item.levelId)
                        )}
                      >
                        {getLevelDisplayName(
                          item.levelId,
                          level?.name ?? tExceptions('unknownLevel')
                        )}
                      </span>
                    </TableCell>

                    {/* Message */}
                    <TableCell className="py-4">
                      <p className="text-lg font-semibold text-primary">
                        {item.message}
                      </p>
                    </TableCell>

                    {/* Count */}
                    <TableCell className="w-[100px] py-4 text-center">
                      <span className="text-sm font-semibold">
                        {item.count.toLocaleString()}
                      </span>
                    </TableCell>

                    {/* Platform Icon */}
                    <TableCell className="w-[80px] py-4">
                      <div
                        className="flex justify-center"
                        title={platform?.name ?? tExceptions('unknownPlatform')}
                      >
                        <PlatformIcon
                          iconName={platform?.icon}
                          className="text-muted-foreground"
                        />
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="w-[160px] text-right py-4">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-foreground">
                          {relative}
                        </p>
                        <p className="text-xs text-muted-foreground">{absolute}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Vista móvil: cards */}
        <div className="md:hidden divide-y divide-border">
          {data.data.map((item, index) => {
            const level = levels.find((l) => l.id === item.levelId);
            const platform = platforms.find((p) => p.id === item.platformId);
            const absolute = formatDate(item.lastSeen);
            const relative = relativeTimes[index] || absolute;

            return (
              <div
                key={`card-${item.message}-${item.levelId}-${item.platformId}-${index}`}
                className="p-4 space-y-3"
              >
                {/* Header: Badge + Platform + Count */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center rounded px-2 py-1 text-xs font-semibold border',
                        getLevelBadgeClasses(item.levelId)
                      )}
                    >
                      {getLevelDisplayName(
                        item.levelId,
                        level?.name ?? tExceptions('unknownLevel')
                      )}
                    </span>
                    <div
                      className="flex items-center gap-1 text-muted-foreground"
                      title={platform?.name ?? tExceptions('unknownPlatform')}
                    >
                      <PlatformIcon
                        iconName={platform?.icon}
                        className="h-4 w-4"
                      />
                    </div>
                  </div>
                  <span className="text-sm font-semibold">
                    {item.count.toLocaleString()}x
                  </span>
                </div>

                {/* Message */}
                <p className="text-base font-semibold text-primary line-clamp-2">
                  {item.message}
                </p>

                {/* Date */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{relative}</span>
                  <span>{absolute}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
