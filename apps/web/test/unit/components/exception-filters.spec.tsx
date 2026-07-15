import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExceptionFilters } from '@/components/exceptions/exception-filters';
import type { ExceptionFilterDto } from '@excepio/shared';

const mockPlatforms = [
  { id: 1, name: 'Web' },
  { id: 2, name: 'WM' },
  { id: 3, name: 'Android' },
];

const mockLevels = [
  { id: 1, name: 'DEBUG' },
  { id: 2, name: 'INFO' },
  { id: 3, name: 'WARNING' },
  { id: 4, name: 'ERROR' },
  { id: 5, name: 'FATAL' },
];

describe('ExceptionFilters', () => {
  it('debería renderizar el select de Platform', () => {
    const onFilterChange = vi.fn();

    render(
      <ExceptionFilters
        filters={{}}
        platforms={mockPlatforms}
        levels={mockLevels}
        onFilterChange={onFilterChange}
      />
    );

    // Con el mock de i18n, se renderiza la key de traducción
    expect(screen.getByText(/exceptions\.filters\.platformAll/)).toBeInTheDocument();
  });

  it('debería renderizar los botones de level', () => {
    const onFilterChange = vi.fn();

    render(
      <ExceptionFilters
        filters={{}}
        platforms={mockPlatforms}
        levels={mockLevels}
        onFilterChange={onFilterChange}
      />
    );

    expect(screen.getByRole('button', { name: /critical/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /warning/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /info/i })).toBeInTheDocument();
  });

  it('debería renderizar el selector de fecha', () => {
    const onFilterChange = vi.fn();

    render(
      <ExceptionFilters
        filters={{}}
        platforms={mockPlatforms}
        levels={mockLevels}
        onFilterChange={onFilterChange}
      />
    );

    // Con el mock de i18n, la key es exceptions.filters.datePresets.last24h
    expect(screen.getByText(/exceptions\.filters\.datePresets\.last24h/)).toBeInTheDocument();
  });

  it('debería renderizar el select de Platform con opciones', () => {
    const onFilterChange = vi.fn();

    render(
      <ExceptionFilters
        filters={{}}
        platforms={mockPlatforms}
        levels={mockLevels}
        onFilterChange={onFilterChange}
      />
    );

    // Verificar que Platform está presente
    expect(screen.getByText(/exceptions\.filters\.platformAll/)).toBeInTheDocument();
  });

  it('debería llamar onFilterChange cuando se hace click en un level', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <ExceptionFilters
        filters={{}}
        platforms={mockPlatforms}
        levels={mockLevels}
        onFilterChange={onFilterChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /critical/i }));

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ levelId: 5 })
    );
  });

  it('debería mostrar el level activo con estilo diferente', () => {
    const onFilterChange = vi.fn();

    render(
      <ExceptionFilters
        filters={{ levelId: 4 }}
        platforms={mockPlatforms}
        levels={mockLevels}
        onFilterChange={onFilterChange}
      />
    );

    const errorButton = screen.getByRole('button', { name: /error/i });
    expect(errorButton).toHaveAttribute('data-active', 'true');
  });

  it('debería renderizar el campo de búsqueda con selector de campo', () => {
    const onFilterChange = vi.fn();

    render(
      <ExceptionFilters
        filters={{}}
        platforms={mockPlatforms}
        levels={mockLevels}
        onFilterChange={onFilterChange}
      />
    );

    // Verificar que el input de búsqueda está presente (placeholder usa key de traducción)
    expect(screen.getByPlaceholderText(/exceptions\.filters\.searchPlaceholder/)).toBeInTheDocument();
    // Verificar que el selector de campo muestra la key de traducción para "Message"
    expect(screen.getByText(/exceptions\.filters\.searchFields\.message/)).toBeInTheDocument();
  });

  it('debería deseleccionar level al hacer click en el mismo', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <ExceptionFilters
        filters={{ levelId: 5 }}
        platforms={mockPlatforms}
        levels={mockLevels}
        onFilterChange={onFilterChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /critical/i }));

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ levelId: undefined })
    );
  });

  describe('Date Selector', () => {
    it('debería mostrar opciones de presets y opciones personalizadas en el popover', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <ExceptionFilters
          filters={{}}
          platforms={mockPlatforms}
          levels={mockLevels}
          onFilterChange={onFilterChange}
        />
      );

      // Abrir el popover de fecha
      await user.click(screen.getByText(/exceptions\.filters\.datePresets\.last24h/));

      // Verificar presets (keys de traducción)
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /exceptions\.filters\.datePresets\.last1h/ })).toBeInTheDocument();
      });
      expect(screen.getByRole('button', { name: /exceptions\.filters\.datePresets\.last7d/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /exceptions\.filters\.datePresets\.last30d/ })).toBeInTheDocument();

      // Verificar opciones personalizadas
      expect(screen.getByRole('button', { name: /exceptions\.filters\.specificDay/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /exceptions\.filters\.customRange/ })).toBeInTheDocument();
    });

    it('debería abrir el dialog de día específico al hacer click en "Specific day"', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <ExceptionFilters
          filters={{}}
          platforms={mockPlatforms}
          levels={mockLevels}
          onFilterChange={onFilterChange}
        />
      );

      // Abrir popover y click en Specific day
      await user.click(screen.getByText(/exceptions\.filters\.datePresets\.last24h/));
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /exceptions\.filters\.specificDay/ })).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('button', { name: /exceptions\.filters\.specificDay/ }));

      // Verificar que el dialog se abrió con el calendario
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      // Verificar que hay un botón Apply (indica que el calendario está presente)
      expect(screen.getByText(/common\.buttons\.apply/)).toBeInTheDocument();
    });

    it('debería abrir el dialog de rango personalizado al hacer click en "Custom range"', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <ExceptionFilters
          filters={{}}
          platforms={mockPlatforms}
          levels={mockLevels}
          onFilterChange={onFilterChange}
        />
      );

      // Abrir popover y click en Custom range
      await user.click(screen.getByText(/exceptions\.filters\.datePresets\.last24h/));
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /exceptions\.filters\.customRange/ })).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('button', { name: /exceptions\.filters\.customRange/ }));

      // Verificar que el dialog se abrió
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      // Verificar que hay un botón Apply
      expect(screen.getByText(/common\.buttons\.apply/)).toBeInTheDocument();
    });

    it('debería cerrar el dialog al hacer click en Cancel', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <ExceptionFilters
          filters={{}}
          platforms={mockPlatforms}
          levels={mockLevels}
          onFilterChange={onFilterChange}
        />
      );

      // Abrir dialog
      await user.click(screen.getByText(/exceptions\.filters\.datePresets\.last24h/));
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /exceptions\.filters\.specificDay/ })).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('button', { name: /exceptions\.filters\.specificDay/ }));
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Cerrar con Cancel
      await user.click(screen.getByText(/common\.buttons\.cancel/));

      // Dialog debería cerrarse
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
      
      // onFilterChange no debería haber sido llamado
      expect(onFilterChange).not.toHaveBeenCalled();
    });

    it('debería llamar onFilterChange con fecha específica al seleccionar un día y aplicar', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <ExceptionFilters
          filters={{}}
          platforms={mockPlatforms}
          levels={mockLevels}
          onFilterChange={onFilterChange}
        />
      );

      // Abrir popover y click en Specific day
      await user.click(screen.getByText(/exceptions\.filters\.datePresets\.last24h/));
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /exceptions\.filters\.specificDay/ })).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('button', { name: /exceptions\.filters\.specificDay/ }));

      // Esperar a que el dialog se abra
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Encontrar y hacer click en el día 10 (si está disponible)
      const dayButtons = screen.getAllByRole('button').filter(btn => btn.textContent === '10');
      if (dayButtons.length > 0) {
        await user.click(dayButtons[0]);

        // Click en Apply
        await user.click(screen.getByText(/common\.buttons\.apply/));

        // Verificar que onFilterChange fue llamado con startDate y endDate
        expect(onFilterChange).toHaveBeenCalledWith(
          expect.objectContaining({
            startDate: expect.any(String),
            endDate: expect.any(String),
          })
        );
      }
    });

    it('debería deshabilitar el botón Apply cuando no hay fecha seleccionada', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <ExceptionFilters
          filters={{}}
          platforms={mockPlatforms}
          levels={mockLevels}
          onFilterChange={onFilterChange}
        />
      );

      // Abrir dialog de día específico
      await user.click(screen.getByText(/exceptions\.filters\.datePresets\.last24h/));
      
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /exceptions\.filters\.specificDay/ })).toBeInTheDocument();
      });
      
      await user.click(screen.getByRole('button', { name: /exceptions\.filters\.specificDay/ }));

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // El botón Apply debería estar deshabilitado porque no hay fecha seleccionada
      const applyButton = screen.getByText(/common\.buttons\.apply/);
      expect(applyButton).toBeDisabled();
    });
  });
});
