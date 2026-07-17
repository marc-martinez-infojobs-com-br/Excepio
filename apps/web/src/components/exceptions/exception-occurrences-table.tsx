'use client';

import { useTranslations } from 'next-intl';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@components/ui/table';
import { PlatformIcon } from '@components/platforms/platform-icon';
import type { OccurrenceDto } from '@excepio/shared';

interface ExceptionOccurrencesTableProps {
  occurrences: OccurrenceDto[] | undefined;
  totalOccurrences: number | undefined;
}

function formatDateTime(isoDate: string): { relative: string; absolute: string } {
  const date = new Date(isoDate);
  const absolute = date.toISOString().slice(0, 19).replace('T', ' ');
  
  // Tiempo relativo
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  let relative: string;
  if (diffMins < 1) {
    relative = 'now';
  } else if (diffMins < 60) {
    relative = `${diffMins}m ago`;
  } else if (diffHours < 24) {
    relative = `${diffHours}h ago`;
  } else if (diffDays < 7) {
    relative = `${diffDays}d ago`;
  } else {
    relative = date.toLocaleDateString();
  }

  return { relative, absolute };
}

function truncateUrl(url: string, maxLength: number = 30): string {
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength) + '...';
}

export function ExceptionOccurrencesTable({
  occurrences,
  totalOccurrences,
}: ExceptionOccurrencesTableProps) {
  const t = useTranslations('exceptions.detail');
  const notAvailable = t('fields.notAvailable');

  const data = occurrences || [];
  const total = totalOccurrences || 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {t('occurrences.title')}{' '}
          <span className="text-sm font-normal text-muted-foreground">
            {t('occurrences.totalInTitle', { count: total })}
          </span>
        </h2>
      </div>

      <div className="border border-input rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('occurrences.table.date')}
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('occurrences.table.user')}
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                {t('occurrences.table.platform')}
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('occurrences.table.version')}
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('occurrences.table.url')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {t('occurrences.empty')}
                </TableCell>
              </TableRow>
            ) : (
              data.map((occurrence) => {
                const { relative, absolute } = formatDateTime(occurrence.createdAt);
                return (
                  <TableRow key={occurrence.id} className="border-b border-border">
                    <TableCell className="py-3">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium text-foreground">{relative}</p>
                        <p className="text-xs text-muted-foreground">{absolute}</p>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      {occurrence.userId ? (
                        <span className="text-sm text-foreground">{occurrence.userId}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">{notAvailable}</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex justify-center" title={occurrence.platformName}>
                        <PlatformIcon iconName={occurrence.platformIcon} className="text-muted-foreground" />
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      {occurrence.appVersion ? (
                        <span className="text-sm text-foreground">{occurrence.appVersion}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">{notAvailable}</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      {occurrence.url ? (
                        <span className="text-sm text-foreground" title={occurrence.url}>
                          {truncateUrl(occurrence.url)}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground italic">{notAvailable}</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
