import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HealthStatus } from '@components/health-status';
import { apiClient } from '@lib/api-client';

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('modo normal (card)', () => {
    it('should render loading state initially', () => {
      vi.mocked(apiClient.get).mockImplementation(() => new Promise(() => {}));
      
      renderWithProviders(<HealthStatus />);

      expect(screen.getByText('health.connecting')).toBeInTheDocument();
    });

    it('should keep showing loading while retrying on API failure', async () => {
      // Con retry: true, el componente sigue mostrando "connecting" mientras reintenta
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network Error'));

      renderWithProviders(<HealthStatus />);

      // Sigue mostrando connecting mientras reintenta
      expect(screen.getByText('health.connecting')).toBeInTheDocument();
    });

    it('should render connected state when API responds', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { status: 'ok', timestamp: '2024-01-01T00:00:00.000Z' },
      });

      renderWithProviders(<HealthStatus />);

      await waitFor(() => {
        expect(screen.getByText(/health.connected/)).toBeInTheDocument();
      });
    });
  });

  describe('modo compacto', () => {
    it('should render awakening state initially', () => {
      vi.mocked(apiClient.get).mockImplementation(() => new Promise(() => {}));
      
      renderWithProviders(<HealthStatus compact />);

      expect(screen.getByText('health.awakening')).toBeInTheDocument();
    });

    it('should render awakening state when API fails', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network Error'));

      renderWithProviders(<HealthStatus compact />);

      await waitFor(() => {
        expect(screen.getByText('health.awakening')).toBeInTheDocument();
      });
    });

    it('should render ready state when API responds', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { status: 'ok', timestamp: '2024-01-01T00:00:00.000Z' },
      });

      renderWithProviders(<HealthStatus compact />);

      await waitFor(() => {
        expect(screen.getByText('health.ready')).toBeInTheDocument();
      });
    });

    it('should have pulsing animation when awakening', () => {
      vi.mocked(apiClient.get).mockImplementation(() => new Promise(() => {}));
      
      const { container } = renderWithProviders(<HealthStatus compact />);

      const pulsingDot = container.querySelector('.animate-pulse');
      expect(pulsingDot).toBeInTheDocument();
    });

    it('should not have pulsing animation when ready', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { status: 'ok', timestamp: '2024-01-01T00:00:00.000Z' },
      });

      const { container } = renderWithProviders(<HealthStatus compact />);

      await waitFor(() => {
        expect(screen.getByText('health.ready')).toBeInTheDocument();
      });

      const pulsingDot = container.querySelector('.animate-pulse');
      expect(pulsingDot).not.toBeInTheDocument();
    });
  });
});
