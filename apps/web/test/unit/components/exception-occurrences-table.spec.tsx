import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExceptionOccurrencesTable } from '@components/exceptions/exception-occurrences-table';
import type { OccurrenceDto } from '@excepio/shared';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      'occurrences.title': 'Last 10 occurrences',
      'occurrences.totalInTitle': `(${params?.count ?? 0} total)`,
      'occurrences.table.date': 'Date',
      'occurrences.table.user': 'User',
      'occurrences.table.platform': 'Platform',
      'occurrences.table.version': 'Version',
      'occurrences.table.url': 'URL',
      'occurrences.empty': 'No occurrences',
      'fields.notAvailable': 'N/A',
    };
    return translations[key] || key;
  }),
}));

const mockOccurrences: OccurrenceDto[] = [
  {
    id: '1',
    createdAt: '2024-01-16T10:30:00.000Z',
    userId: 'user-001',
    platformName: 'Web App',
    platformIcon: 'LuGlobe',
    appVersion: '1.2.3',
    url: 'https://example.com/page1',
  },
  {
    id: '2',
    createdAt: '2024-01-16T09:15:00.000Z',
    userId: null,
    platformName: 'API',
    platformIcon: 'LuServer',
    appVersion: null,
    url: null,
  },
  {
    id: '3',
    createdAt: '2024-01-15T14:20:00.000Z',
    userId: 'user-002',
    platformName: 'Mobile',
    platformIcon: 'LuSmartphone',
    appVersion: '2.0.0',
    url: 'https://example.com/page2',
  },
];

describe('ExceptionOccurrencesTable', () => {
  const defaultProps = {
    occurrences: mockOccurrences,
    totalOccurrences: 25,
  };

  it('debería renderizar el título con el total', () => {
    render(<ExceptionOccurrencesTable {...defaultProps} />);

    expect(screen.getByText('Last 10 occurrences')).toBeInTheDocument();
    expect(screen.getByText(/25 total/)).toBeInTheDocument();
  });

  it('debería renderizar las cabeceras de la tabla', () => {
    render(<ExceptionOccurrencesTable {...defaultProps} />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('URL')).toBeInTheDocument();
  });

  it('debería renderizar las filas de ocurrencias', () => {
    render(<ExceptionOccurrencesTable {...defaultProps} />);

    // Usuarios
    expect(screen.getByText('user-001')).toBeInTheDocument();
    expect(screen.getByText('user-002')).toBeInTheDocument();
    // Plataformas (solo icono, nombre en title)
    expect(screen.getByTitle('Web App')).toBeInTheDocument();
    expect(screen.getByTitle('API')).toBeInTheDocument();
    expect(screen.getByTitle('Mobile')).toBeInTheDocument();
    // Versiones
    expect(screen.getByText('1.2.3')).toBeInTheDocument();
    expect(screen.getByText('2.0.0')).toBeInTheDocument();
  });

  it('debería mostrar N/A para valores nulos', () => {
    render(<ExceptionOccurrencesTable {...defaultProps} />);

    const naElements = screen.getAllByText('N/A');
    expect(naElements.length).toBeGreaterThan(0);
  });

  it('debería manejar lista vacía', () => {
    render(
      <ExceptionOccurrencesTable
        occurrences={[]}
        totalOccurrences={0}
      />
    );

    expect(screen.getByText('Last 10 occurrences')).toBeInTheDocument();
    expect(screen.getByText('No occurrences')).toBeInTheDocument();
  });

  it('debería manejar undefined gracefully', () => {
    render(
      <ExceptionOccurrencesTable
        occurrences={undefined}
        totalOccurrences={undefined}
      />
    );

    expect(screen.getByText('Last 10 occurrences')).toBeInTheDocument();
  });
});
