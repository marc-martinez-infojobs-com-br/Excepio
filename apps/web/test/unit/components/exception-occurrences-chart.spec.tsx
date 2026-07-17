import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExceptionOccurrencesChart } from '@components/exceptions/exception-occurrences-chart';
import type { OccurrenceByDayDto } from '@excepio/shared';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string, params?: Record<string, unknown>) => {
    const translations: Record<string, string> = {
      'occurrences.chartTitle': 'Occurrences (last 7 days)',
      'occurrences.total': `${params?.count ?? 0} total occurrences`,
    };
    return translations[key] || key;
  }),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({ resolvedTheme: 'light' })),
}));

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  Tooltip: () => <div data-testid="tooltip" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
}));

const mockOccurrencesByDay: OccurrenceByDayDto[] = [
  { date: '2024-01-10', count: 5 },
  { date: '2024-01-11', count: 3 },
  { date: '2024-01-12', count: 8 },
  { date: '2024-01-13', count: 2 },
  { date: '2024-01-14', count: 0 },
  { date: '2024-01-15', count: 4 },
  { date: '2024-01-16', count: 6 },
];

describe('ExceptionOccurrencesChart', () => {
  it('debería renderizar el título del gráfico', () => {
    render(
      <ExceptionOccurrencesChart
        occurrencesByDay={mockOccurrencesByDay}
        totalOccurrences={28}
      />
    );

    expect(screen.getByText('Occurrences (last 7 days)')).toBeInTheDocument();
  });

  it('debería renderizar el total de ocurrencias', () => {
    render(
      <ExceptionOccurrencesChart
        occurrencesByDay={mockOccurrencesByDay}
        totalOccurrences={28}
      />
    );

    expect(screen.getByText(/28/)).toBeInTheDocument();
  });

  it('debería renderizar el contenedor del gráfico', () => {
    render(
      <ExceptionOccurrencesChart
        occurrencesByDay={mockOccurrencesByDay}
        totalOccurrences={28}
      />
    );

    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('debería manejar datos vacíos', () => {
    render(
      <ExceptionOccurrencesChart
        occurrencesByDay={[]}
        totalOccurrences={0}
      />
    );

    expect(screen.getByText('Occurrences (last 7 days)')).toBeInTheDocument();
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  it('debería manejar undefined gracefully', () => {
    render(
      <ExceptionOccurrencesChart
        occurrencesByDay={undefined}
        totalOccurrences={undefined}
      />
    );

    expect(screen.getByText('Occurrences (last 7 days)')).toBeInTheDocument();
  });
});
