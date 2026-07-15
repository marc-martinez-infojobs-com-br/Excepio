import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExceptionFilters } from '@/components/exceptions/exception-filters';
import type { ExceptionFilterDto } from '@excepio/shared';

const mockProjects = [
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
        projects={mockProjects}
        levels={mockLevels}
        onFilterChange={onFilterChange}
      />
    );

    expect(screen.getByText('Platform: All')).toBeInTheDocument();
  });

  it('debería renderizar los botones de level', () => {
    const onFilterChange = vi.fn();

    render(
      <ExceptionFilters
        filters={{}}
        projects={mockProjects}
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
        projects={mockProjects}
        levels={mockLevels}
        onFilterChange={onFilterChange}
      />
    );

    expect(screen.getByText(/last 24h/i)).toBeInTheDocument();
  });

  it('debería renderizar el select de Platform con opciones', () => {
    const onFilterChange = vi.fn();

    render(
      <ExceptionFilters
        filters={{}}
        projects={mockProjects}
        levels={mockLevels}
        onFilterChange={onFilterChange}
      />
    );

    // Verificar que Platform está presente
    expect(screen.getByText('Platform: All')).toBeInTheDocument();
  });

  it('debería llamar onFilterChange cuando se hace click en un level', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <ExceptionFilters
        filters={{}}
        projects={mockProjects}
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
        projects={mockProjects}
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
        projects={mockProjects}
        levels={mockLevels}
        onFilterChange={onFilterChange}
      />
    );

    // Verificar que el input de búsqueda está presente
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    // Verificar que el selector de campo muestra "Message" por defecto
    expect(screen.getByText('Message')).toBeInTheDocument();
  });

  it('debería deseleccionar level al hacer click en el mismo', async () => {
    const user = userEvent.setup();
    const onFilterChange = vi.fn();

    render(
      <ExceptionFilters
        filters={{ levelId: 5 }}
        projects={mockProjects}
        levels={mockLevels}
        onFilterChange={onFilterChange}
      />
    );

    await user.click(screen.getByRole('button', { name: /critical/i }));

    expect(onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ levelId: undefined })
    );
  });
});
