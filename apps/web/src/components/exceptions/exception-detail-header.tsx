'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@lib/utils';
import type { ExceptionDetailDto } from '@excepio/shared';

interface ExceptionDetailHeaderProps {
  exception: ExceptionDetailDto;
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
 * Retorna el nombre del badge para mostrar
 */
function getLevelDisplayName(levelId: number, levelName?: string): string {
  if (levelId === 5) return 'CRITICAL';
  return levelName || getLevelFallbackName(levelId);
}

/**
 * Retorna nombre por defecto basado en levelId
 */
function getLevelFallbackName(levelId: number): string {
  switch (levelId) {
    case 1: return 'DEBUG';
    case 2: return 'INFO';
    case 3: return 'WARNING';
    case 4: return 'ERROR';
    case 5: return 'CRITICAL';
    default: return 'UNKNOWN';
  }
}

/**
 * Calcula el tiempo relativo
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

export function ExceptionDetailHeader({ exception }: ExceptionDetailHeaderProps) {
  const tTime = useTranslations('exceptions.time');
  const [relativeTime, setRelativeTime] = useState<string>('');

  // Calcular tiempo relativo solo en cliente para evitar hydration mismatch
  useEffect(() => {
    setRelativeTime(getRelativeTime(exception.createdAt, tTime));
  }, [exception.createdAt, tTime]);

  // Fallback para SSR
  const displayTime = relativeTime || new Date(exception.createdAt).toLocaleDateString();

  return (
    <div className="space-y-4">
      {/* Severity badge + time */}
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'inline-flex items-center rounded px-2 py-1 text-xs font-semibold border',
            getLevelBadgeClasses(exception.levelId)
          )}
        >
          {getLevelDisplayName(exception.levelId, exception.levelName)}
        </span>
        <span className="text-sm text-muted-foreground">{displayTime}</span>
      </div>

      {/* Message title */}
      <h1 className="text-2xl md:text-3xl font-bold text-foreground">
        {exception.message}
      </h1>
    </div>
  );
}
