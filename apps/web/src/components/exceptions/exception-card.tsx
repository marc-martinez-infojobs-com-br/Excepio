'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Monitor, Server, Cpu, Smartphone } from 'lucide-react';
import type { ExceptionDto } from '@excepio/shared';

interface Project {
  id: number;
  name: string;
}

interface Level {
  id: number;
  name: string;
}

interface ExceptionCardProps {
  exception: ExceptionDto;
  projects: Project[];
  levels: Level[];
  onClick?: (id: string) => void;
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
function getLevelDisplayName(levelId: number, levelName: string): string {
  if (levelId === 5) return 'CRITICAL';
  return levelName;
}

/**
 * Retorna el icono correspondiente al proyecto
 */
function getProjectIcon(projectName: string) {
  const iconClass = "h-4 w-4";
  
  switch (projectName.toLowerCase()) {
    case 'web':
      return <Monitor className={iconClass} />;
    case 'wm':
      return <Smartphone className={iconClass} />;
    case 'android':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10zM3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8zm17 0c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5zm-4.97-5.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84zM10 5H9V4h1v1zm5 0h-1V4h1v1z"/>
        </svg>
      );
    case 'ios':
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      );
    case 'api':
      return <Server className={iconClass} />;
    default:
      return <Cpu className={iconClass} />;
  }
}

/**
 * Calcula el tiempo relativo
 */
function getRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}

/**
 * Extrae las primeras líneas del stack trace
 */
function getStackTracePreview(stackTrace: string | null | undefined, maxLines: number = 2): string | null {
  if (!stackTrace) return null;
  const lines = stackTrace.split('\n').slice(0, maxLines);
  return lines.map(line => line.trim()).join('\n');
}

export function ExceptionCard({ exception, projects, levels, onClick }: ExceptionCardProps) {
  const [relativeTime, setRelativeTime] = useState<string>('');
  const level = levels.find((l) => l.id === exception.levelId);
  const project = projects.find((p) => p.id === exception.projectId);
  const stackPreview = getStackTracePreview(exception.stackTrace);

  useEffect(() => {
    setRelativeTime(getRelativeTime(exception.createdAt));
  }, [exception.createdAt]);

  const handleClick = () => {
    onClick?.(exception.id);
  };

  return (
    <div
      className="border border-input rounded-lg p-3 bg-card hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      {/* Header: Badge + Platform + Time */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={cn(
            'inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold border',
            getLevelBadgeClasses(exception.levelId)
          )}
        >
          {getLevelDisplayName(exception.levelId, level?.name ?? 'UNKNOWN')}
        </span>
        <div className="flex items-center gap-2 text-muted-foreground text-xs">
          <span className="flex items-center gap-1" title={project?.name ?? 'Unknown'}>
            {getProjectIcon(project?.name ?? '')}
            <span className="sr-only md:not-sr-only">{project?.name}</span>
          </span>
          <span>•</span>
          <span>{relativeTime || '...'}</span>
        </div>
      </div>

      {/* Message */}
      <p className="text-base font-semibold text-primary mb-1 line-clamp-2">
        {exception.message}
      </p>

      {/* Stack Trace Preview */}
      {stackPreview && (
        <p className="text-sm font-mono text-muted-foreground line-clamp-2 whitespace-pre-line">
          {stackPreview}
        </p>
      )}
    </div>
  );
}
