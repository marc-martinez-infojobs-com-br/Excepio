import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HealthStatus } from '@components/health-status';

// Mock del cliente API
vi.mock('@lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>
  );
};

describe('HealthStatus', () => {
  it('should render loading state initially', () => {
    renderWithProviders(<HealthStatus />);

    // El mock de useTranslations devuelve la key, así que buscamos la key
    expect(screen.getByText('health.connecting')).toBeInTheDocument();
  });
});
