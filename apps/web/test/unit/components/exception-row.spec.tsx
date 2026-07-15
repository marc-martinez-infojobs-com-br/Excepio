import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExceptionRow } from '@/components/exceptions/exception-row';
import type { ExceptionDto } from '@excepio/shared';

const mockException: ExceptionDto = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  projectId: 1,
  levelId: 4,
  message: 'NullReferenceException: Object reference not set to an instance',
  stackTrace: 'at AuthService.validateToken (auth_service.py:42)',
  userId: 'user_001',
  url: '/api/auth/login',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  appVersion: '1.0.0',
  metadata: { environment: 'production' },
  createdAt: '2024-01-15T10:30:00.000Z',
};

// Mock de proyectos y levels para mostrar nombres
const mockProjects = [
  { id: 1, name: 'Web' },
  { id: 2, name: 'Android' },
  { id: 3, name: 'iOS' },
];

const mockLevels = [
  { id: 1, name: 'DEBUG' },
  { id: 2, name: 'INFO' },
  { id: 3, name: 'WARNING' },
  { id: 4, name: 'ERROR' },
  { id: 5, name: 'FATAL' },
];

describe('ExceptionRow', () => {
  it('debería renderizar el mensaje de la excepción', () => {
    render(
      <table>
        <tbody>
          <ExceptionRow
            exception={mockException}
            projects={mockProjects}
            levels={mockLevels}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText(/NullReferenceException/)).toBeInTheDocument();
  });

  it('debería renderizar el badge de level con el nombre correcto', () => {
    render(
      <table>
        <tbody>
          <ExceptionRow
            exception={mockException}
            projects={mockProjects}
            levels={mockLevels}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText('ERROR')).toBeInTheDocument();
  });

  it('debería renderizar el icono del proyecto con tooltip', () => {
    render(
      <table>
        <tbody>
          <ExceptionRow
            exception={mockException}
            projects={mockProjects}
            levels={mockLevels}
          />
        </tbody>
      </table>
    );

    // El nombre del proyecto aparece como title (tooltip)
    const iconContainer = screen.getByTitle('Web');
    expect(iconContainer).toBeInTheDocument();
  });

  it('debería renderizar la fecha formateada', () => {
    render(
      <table>
        <tbody>
          <ExceptionRow
            exception={mockException}
            projects={mockProjects}
            levels={mockLevels}
          />
        </tbody>
      </table>
    );

    // Verificamos que hay elementos con la fecha (hay dos: relativa y absoluta)
    const dateElements = screen.getAllByText(/2024/);
    expect(dateElements.length).toBeGreaterThanOrEqual(1);
  });

  it('debería aplicar estilo rojo al badge para ERROR', () => {
    render(
      <table>
        <tbody>
          <ExceptionRow
            exception={mockException}
            projects={mockProjects}
            levels={mockLevels}
          />
        </tbody>
      </table>
    );

    const badge = screen.getByText('ERROR');
    // ERROR usa fondo rojo con transparencia
    expect(badge).toHaveClass('bg-red-500/10');
    expect(badge).toHaveClass('text-red-600');
  });

  it('debería aplicar estilo warning al badge para WARNING', () => {
    const warningException = { ...mockException, levelId: 3 };

    render(
      <table>
        <tbody>
          <ExceptionRow
            exception={warningException}
            projects={mockProjects}
            levels={mockLevels}
          />
        </tbody>
      </table>
    );

    const badge = screen.getByText('WARNING');
    // WARNING usa fondo ámbar con transparencia
    expect(badge).toHaveClass('bg-amber-500/10');
    expect(badge).toHaveClass('text-amber-600');
  });

  it('debería aplicar estilo critical al badge para FATAL (mostrado como CRITICAL)', () => {
    const fatalException = { ...mockException, levelId: 5 };

    render(
      <table>
        <tbody>
          <ExceptionRow
            exception={fatalException}
            projects={mockProjects}
            levels={mockLevels}
          />
        </tbody>
      </table>
    );

    // FATAL se muestra como CRITICAL
    const badge = screen.getByText('CRITICAL');
    // CRITICAL usa fondo rosa con más opacidad (diferenciado de ERROR)
    expect(badge).toHaveClass('bg-rose-500/15');
    expect(badge).toHaveClass('text-rose-700');
  });

  it('debería mostrar el stackTrace truncado si existe', () => {
    render(
      <table>
        <tbody>
          <ExceptionRow
            exception={mockException}
            projects={mockProjects}
            levels={mockLevels}
          />
        </tbody>
      </table>
    );

    expect(screen.getByText(/auth_service\.py/)).toBeInTheDocument();
  });

  it('debería tener un link clickeable que apunta al detalle', () => {
    render(
      <table>
        <tbody>
          <ExceptionRow
            exception={mockException}
            projects={mockProjects}
            levels={mockLevels}
          />
        </tbody>
      </table>
    );

    // El role es "link" porque le pusimos role="link" al tr
    const row = screen.getByRole('link');
    expect(row).toHaveAttribute('data-href', `/exceptions/${mockException.id}`);
  });
});
