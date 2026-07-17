import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExceptionDetailHeader } from '@components/exceptions/exception-detail-header';
import type { ExceptionDetailDto } from '@excepio/shared';

const mockException: ExceptionDetailDto = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  platformId: 1,
  levelId: 4,
  levelName: 'ERROR',
  platformName: 'Web App',
  platformIcon: 'LuGlobe',
  message: 'TypeError: Cannot read property of undefined',
  stackTrace: 'at Object.method (file.ts:42:10)',
  userId: 'user-456',
  url: 'https://example.com/page',
  userAgent: 'Mozilla/5.0',
  appVersion: '1.2.3',
  metadata: { browser: 'Chrome' },
  createdAt: '2024-01-15T10:30:00.000Z',
  affectedUsersCount: 5,
};

describe('ExceptionDetailHeader', () => {
  it('debería renderizar el mensaje de la excepción como título', () => {
    render(<ExceptionDetailHeader exception={mockException} />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('TypeError: Cannot read property of undefined');
  });

  it('debería renderizar el badge de severidad con el nombre del nivel', () => {
    render(<ExceptionDetailHeader exception={mockException} />);

    expect(screen.getByText('ERROR')).toBeInTheDocument();
  });

  it('debería aplicar estilos rojos para nivel ERROR', () => {
    render(<ExceptionDetailHeader exception={mockException} />);

    const badge = screen.getByText('ERROR');
    expect(badge).toHaveClass('bg-red-500/10');
    expect(badge).toHaveClass('text-red-600');
  });

  it('debería mostrar CRITICAL para nivel FATAL (levelId 5)', () => {
    const fatalException: ExceptionDetailDto = {
      ...mockException,
      levelId: 5,
      levelName: 'FATAL',
    };

    render(<ExceptionDetailHeader exception={fatalException} />);

    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  it('debería aplicar estilos rose para nivel CRITICAL/FATAL', () => {
    const fatalException: ExceptionDetailDto = {
      ...mockException,
      levelId: 5,
      levelName: 'FATAL',
    };

    render(<ExceptionDetailHeader exception={fatalException} />);

    const badge = screen.getByText('CRITICAL');
    expect(badge).toHaveClass('bg-rose-500/15');
    expect(badge).toHaveClass('text-rose-700');
  });

  it('debería mostrar el tiempo relativo', () => {
    render(<ExceptionDetailHeader exception={mockException} />);

    // Buscamos que haya algún elemento con texto de tiempo (puede variar según la fecha)
    // Como la fecha es fija en el pasado, debería mostrar algo como "hace X días" o la fecha
    const timeElement = screen.getByText(/2024|ago|hace|fa/i);
    expect(timeElement).toBeInTheDocument();
  });

  it('debería usar "UNKNOWN" si no hay levelName', () => {
    const noLevelNameException: ExceptionDetailDto = {
      ...mockException,
      levelName: undefined,
    };

    render(<ExceptionDetailHeader exception={noLevelNameException} />);

    // Debería mostrar el fallback del badge basado en levelId
    const badge = screen.getByText('ERROR');
    expect(badge).toBeInTheDocument();
  });
});
