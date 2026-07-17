'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@components/ui/table';
import { ExceptionRow } from '@components/exceptions/exception-row';
import { ExceptionCard } from '@components/exceptions/exception-card';
import { ExceptionFilters } from '@components/exceptions/exception-filters';
import { ExceptionPagination } from '@components/exceptions/exception-pagination';
import { useExceptions } from '@hooks/use-exceptions';
import { useLevels } from '@hooks/use-levels';
import { usePlatforms } from '@hooks/use-platforms';
import type { ExceptionFilterDto } from '@excepio/shared';
import { useTranslations } from 'next-intl';

const ISSUES_STATE_KEY = 'excepio_issues_state';
const STATE_TTL_MS = 5 * 60 * 1000; // 5 minutos

interface IssuesState {
  filters: ExceptionFilterDto;
  page: number;
  limit: number;
  timestamp: number;
}

function saveIssuesState(state: Omit<IssuesState, 'timestamp'>) {
  const stateWithTimestamp: IssuesState = {
    ...state,
    timestamp: Date.now(),
  };
  sessionStorage.setItem(ISSUES_STATE_KEY, JSON.stringify(stateWithTimestamp));
}

function loadIssuesState(): Omit<IssuesState, 'timestamp'> | null {
  const saved = sessionStorage.getItem(ISSUES_STATE_KEY);
  if (saved) {
    try {
      const state: IssuesState = JSON.parse(saved);
      // Verificar si ha expirado
      if (Date.now() - state.timestamp > STATE_TTL_MS) {
        sessionStorage.removeItem(ISSUES_STATE_KEY);
        return null;
      }
      return {
        filters: state.filters,
        page: state.page,
        limit: state.limit,
      };
    } catch {
      return null;
    }
  }
  return null;
}

export default function ExceptionsPage() {
  const t = useTranslations('exceptions');
  const router = useRouter();
  const [filters, setFilters] = useState<ExceptionFilterDto>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [isInitialized, setIsInitialized] = useState(false);

  // Restaurar estado desde sessionStorage al montar
  useEffect(() => {
    const savedState = loadIssuesState();
    if (savedState) {
      setFilters(savedState.filters);
      setPage(savedState.page);
      setLimit(savedState.limit);
    }
    setIsInitialized(true);
  }, []);

  const { data: levelsData } = useLevels();
  const { data: platformsData } = usePlatforms();

  const { data, isLoading, error } = useExceptions({
    ...filters,
    page,
    limit,
  });

  // Mapear los datos a la estructura esperada por los componentes
  const levels = levelsData ?? [];
  const platforms = platformsData ?? [];

  const handleFilterChange = (newFilters: ExceptionFilterDto) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleRowClick = (id: string) => {
    // Guardar estado antes de navegar
    saveIssuesState({ filters, page, limit });
    router.push(`/issues/${id}`);
  };

  // No renderizar hasta que se haya inicializado el estado
  if (!isInitialized) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      {/* Filtros */}
      <ExceptionFilters
        filters={filters}
        platforms={platforms}
        levels={levels}
        onFilterChange={handleFilterChange}
      />

      {/* Total de registros */}
      {!isLoading && data && (
        <div className="flex justify-start">
          <p className="text-sm text-muted-foreground">
            {data.total.toLocaleString()} {t('pagination.issues')}
          </p>
        </div>
      )}

      {/* Mobile: Cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            {t('errors.loading')}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t('empty')}
          </div>
        ) : (
          data?.data.map((exception) => (
            <ExceptionCard
              key={exception.id}
              exception={exception}
              platforms={platforms}
              levels={levels}
              onClick={handleRowClick}
            />
          ))
        )}
      </div>

      {/* Desktop: Table */}
      <div className="hidden md:block border border-input rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[120px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('table.severity')}
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('table.issue')}
              </TableHead>
              <TableHead className="w-[80px] text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                {t('table.platform')}
              </TableHead>
              <TableHead className="w-[160px] text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {t('table.lastSeen')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <td colSpan={4} className="py-12">
                  <div className="flex justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                </td>
              </TableRow>
            ) : error ? (
              <TableRow>
                <td colSpan={4} className="text-center py-8 text-destructive">
                  {t('errors.loading')}
                </td>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <td colSpan={4} className="text-center py-8 text-muted-foreground">
                  {t('empty')}
                </td>
              </TableRow>
            ) : (
              data?.data.map((exception) => (
                <ExceptionRow
                  key={exception.id}
                  exception={exception}
                  platforms={platforms}
                  levels={levels}
                  onClick={handleRowClick}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      {data && data.total > 0 && (
        <ExceptionPagination
          page={page}
          limit={limit}
          total={data.total}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      )}
    </div>
  );
}
