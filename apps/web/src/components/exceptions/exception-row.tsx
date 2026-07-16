'use client';

import { useState, useEffect } from 'react';
import { TableCell, TableRow } from '@components/ui/table';
import { cn } from '@lib/utils';
import type { ExceptionDto, PlatformDto, LevelDto } from '@excepio/shared';
import { useTranslations } from 'next-intl';
import { PlatformIcon } from '@components/platforms/platform-icon';

interface ExceptionRowProps {
  exception: ExceptionDto;
  platforms: PlatformDto[];
  levels: LevelDto[];
  onClick?: (id: string) => void;
}

/**
 * Retorna las clases CSS para el badge según el nivel de severidad
 * Usa transparencias para adaptarse a light/dark mode:
 * - Light mode: fondo con más transparencia
 * - Dark mode: fondo con menos transparencia (más visible)
 * 
 * - CRITICAL/FATAL: Rojo oscuro (más intenso que ERROR)
 * - ERROR: Rojo
 * - WARNING: Amarillo/Naranja
 * - INFO: Azul
 * - DEBUG: Gris
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
function getLevelDisplayName(levelId: number, levelName: string): string {
  // FATAL se muestra como CRITICAL en el diseño
  if (levelId === 5) return 'CRITICAL';
  return levelName;
}

/**
 * Formatea una fecha ISO a un formato legible
 * Retorna solo el formato absoluto para SSR, el relativo se calcula en cliente
 */
function formatDate(isoDate: string): { relative: string; absolute: string } {
  const date = new Date(isoDate);
  
  // Formato absoluto: YYYY-MM-DD HH:MM:SS (seguro para SSR)
  const absolute = date.toISOString().slice(0, 19).replace('T', ' ');

  return { relative: '', absolute };
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
 * Extrae la primera línea del stack trace para mostrar en el listado
 */
function getStackTracePreview(stackTrace: string | null | undefined): string | null {
  if (!stackTrace) return null;
  const firstLine = stackTrace.split('\n')[0].trim();
  // Limitar a 80 caracteres
  return firstLine.length > 80 ? `${firstLine.substring(0, 80)}...` : firstLine;
}

export function ExceptionRow({ exception, platforms, levels, onClick }: ExceptionRowProps) {
  const t = useTranslations('exceptions');
  const tTime = useTranslations('exceptions.time');
  const [relativeTime, setRelativeTime] = useState<string>('');
  const level = levels.find((l) => l.id === exception.levelId);
  const platform = platforms.find((p) => p.id === exception.platformId);
  const { absolute } = formatDate(exception.createdAt);
  const stackPreview = getStackTracePreview(exception.stackTrace);

  // Calcular tiempo relativo solo en cliente para evitar hydration mismatch
  useEffect(() => {
    setRelativeTime(getRelativeTime(exception.createdAt, tTime));
  }, [exception.createdAt, tTime]);

  const handleClick = () => {
    onClick?.(exception.id);
  };

  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 border-b border-border"
      onClick={handleClick}
      data-href={`/issues/${exception.id}`}
      role="link"
    >
      {/* Severity Badge */}
      <TableCell className="w-[120px] py-4">
        <span
          className={cn(
            'inline-flex items-center rounded px-2 py-1 text-xs font-semibold border',
            getLevelBadgeClasses(exception.levelId)
          )}
        >
          {getLevelDisplayName(exception.levelId, level?.name ?? t('unknownLevel'))}
        </span>
      </TableCell>

      {/* Message & Stack Trace */}
      <TableCell className="py-4">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-primary hover:underline">
            {exception.message}
          </p>
          {stackPreview && (
            <p className="text-sm font-mono text-muted-foreground">
              {stackPreview}
            </p>
          )}
        </div>
      </TableCell>

      {/* Platform Icon - usa el icono dinámico de la plataforma */}
      <TableCell className="w-[80px] py-4">
        <div className="flex justify-center" title={platform?.name ?? t('unknownPlatform')}>
          <PlatformIcon iconName={platform?.icon} className="text-muted-foreground" />
        </div>
      </TableCell>

      {/* Date */}
      <TableCell className="w-[160px] text-right py-4">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">{relativeTime || absolute}</p>
          <p className="text-xs text-muted-foreground">{absolute}</p>
        </div>
      </TableCell>
    </TableRow>
  );
}
