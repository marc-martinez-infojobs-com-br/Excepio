'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExceptionRow } from '@/components/exceptions/exception-row';
import { ExceptionFilters } from '@/components/exceptions/exception-filters';
import { ExceptionPagination } from '@/components/exceptions/exception-pagination';
import type { ExceptionDto, ExceptionFilterDto } from '@excepio/shared';

// Datos fake para visualizar el componente
const fakeExceptions: ExceptionDto[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    projectId: 1,
    levelId: 5, // CRITICAL
    message: 'NullReferenceException: Object reference not set to an instance of an object',
    stackTrace: 'at AuthService.validateToken (auth_service.py:42)\n    at Middleware.authenticate (middleware.py:128)',
    userId: 'user_001',
    url: '/api/auth/login',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    appVersion: '1.0.0',
    metadata: { environment: 'production' },
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 mins ago
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174002',
    projectId: 2,
    levelId: 3, // WARNING
    message: 'TimeoutError: Connection failed to redis-cluster-01',
    stackTrace: 'at CacheManager.connect (cache_manager.go:118)',
    userId: 'user_042',
    url: '/api/cache/connect',
    userAgent: 'PostmanRuntime/7.35.0',
    appVersion: '2.0.0-beta',
    metadata: null,
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(), // 14 mins ago
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174003',
    projectId: 1,
    levelId: 4, // ERROR
    message: 'SyntaxError: Unexpected token < in JSON at position 0',
    stackTrace: 'at bundle.js:4530\n    at Array.forEach (<anonymous>)',
    userId: null,
    url: '/dashboard',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    appVersion: '1.2.0',
    metadata: { requestId: 'abc-123' },
    createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(), // 28 mins ago
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174004',
    projectId: 3,
    levelId: 2, // INFO
    message: 'UserLoggedOut: Session expired for uid-849',
    stackTrace: 'at SecurityMiddleware.sessionCheck (security.middleware.js:201)',
    userId: 'user_849',
    url: '/api/auth/session',
    userAgent: 'okhttp/4.12.0',
    appVersion: '2.1.0',
    metadata: null,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174006',
    projectId: 4,
    levelId: 1, // DEBUG
    message: 'DebugInfo: Cache hit ratio at 94.5%, threshold is 90%',
    stackTrace: 'at CacheMonitor.logMetrics (cache_monitor.ts:45)',
    userId: null,
    url: '/internal/metrics',
    userAgent: 'Node.js/20.0.0',
    appVersion: '2.1.0',
    metadata: { hitRatio: 0.945, threshold: 0.9 },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174005',
    projectId: 5,
    levelId: 5, // CRITICAL
    message: 'DatabaseMigrationError: column "user_role" does not exist',
    stackTrace: 'at MigrationRunner.execute (migrations/0024_add_role.sql:15)',
    userId: 'admin_001',
    url: null,
    userAgent: 'Node.js/20.0.0',
    appVersion: '1.0.0',
    metadata: { migration: '0024_add_role' },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
  },
];

const fakeProjects = [
  { id: 1, name: 'Web' },
  { id: 2, name: 'WM' },
  { id: 3, name: 'Android' },
  { id: 4, name: 'iOS' },
  { id: 5, name: 'API' },
];

const fakeLevels = [
  { id: 1, name: 'DEBUG' },
  { id: 2, name: 'INFO' },
  { id: 3, name: 'WARNING' },
  { id: 4, name: 'ERROR' },
  { id: 5, name: 'FATAL' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<ExceptionFilterDto>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);

  const handleRowClick = (id: string) => {
    console.log('Navigate to exception:', id);
  };

  const handleFilterChange = (newFilters: ExceptionFilterDto) => {
    console.log('Filters changed:', newFilters);
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (newPage: number) => {
    console.log('Page changed:', newPage);
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    console.log('Limit changed:', newLimit);
    setLimit(newLimit);
    setPage(1); // Reset to first page when limit changes
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Bienvenido a Excepio</h1>
      {user && (
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Usuario: <span className="font-medium text-foreground">{user.name}</span>
          </p>
          <p className="text-muted-foreground">
            Email: <span className="font-medium text-foreground">{user.email}</span>
          </p>
          <p className="text-muted-foreground">
            Rol: <span className="font-medium text-foreground">{user.role}</span>
          </p>
        </div>
      )}

      {/* Preview de ExceptionFilters */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Preview: ExceptionFilters Component</h2>
        <ExceptionFilters
          filters={filters}
          projects={fakeProjects}
          levels={fakeLevels}
          onFilterChange={handleFilterChange}
        />
        <pre className="mt-4 p-2 bg-muted rounded text-xs">
          Active filters: {JSON.stringify(filters, null, 2)}
        </pre>
      </div>

      {/* Preview de ExceptionRow con datos fake */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Preview: ExceptionRow Component</h2>
        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
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
              {fakeExceptions.map((exception) => (
                <ExceptionRow
                  key={exception.id}
                  exception={exception}
                  projects={fakeProjects}
                  levels={fakeLevels}
                  onClick={handleRowClick}
                />
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4">
          <ExceptionPagination
            page={page}
            limit={limit}
            total={1284}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </div>
      </div>
    </div>
  );
}
