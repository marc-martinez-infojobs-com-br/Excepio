'use client';

import { useState } from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExceptionRow } from '@/components/exceptions/exception-row';
import { ExceptionFilters } from '@/components/exceptions/exception-filters';
import { ExceptionPagination } from '@/components/exceptions/exception-pagination';
import { useExceptions } from '@/hooks/use-exceptions';
import type { ExceptionFilterDto } from '@excepio/shared';

// TODO: Estos datos vendrán de hooks useProjects y useLevels en Fase 7
const projects = [
  { id: 1, name: 'Web' },
  { id: 2, name: 'WM' },
  { id: 3, name: 'Android' },
  { id: 4, name: 'iOS' },
  { id: 5, name: 'API' },
];

const levels = [
  { id: 1, name: 'DEBUG' },
  { id: 2, name: 'INFO' },
  { id: 3, name: 'WARNING' },
  { id: 4, name: 'ERROR' },
  { id: 5, name: 'FATAL' },
];

export default function ExceptionsPage() {
  const [filters, setFilters] = useState<ExceptionFilterDto>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const { data, isLoading, error } = useExceptions({
    ...filters,
    page,
    limit,
  });

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
    // TODO: Navegar al detalle de la excepción
    console.log('Navigate to exception:', id);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header con título y filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Exceptions</h1>
          <p className="text-sm text-muted-foreground">
            {isLoading ? 'Loading...' : `${data?.total.toLocaleString() ?? 0} issues`}
          </p>
        </div>
        <ExceptionFilters
          filters={filters}
          projects={projects}
          levels={levels}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Tabla de excepciones */}
      <div className="border border-input rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[120px] text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Severity
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Issue
              </TableHead>
              <TableHead className="w-[80px] text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                Platform
              </TableHead>
              <TableHead className="w-[160px] text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Last Seen
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <td colSpan={4} className="text-center py-8 text-muted-foreground">
                  Loading...
                </td>
              </TableRow>
            ) : error ? (
              <TableRow>
                <td colSpan={4} className="text-center py-8 text-destructive">
                  Error loading exceptions
                </td>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <td colSpan={4} className="text-center py-8 text-muted-foreground">
                  No exceptions found
                </td>
              </TableRow>
            ) : (
              data?.data.map((exception) => (
                <ExceptionRow
                  key={exception.id}
                  exception={exception}
                  projects={projects}
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
