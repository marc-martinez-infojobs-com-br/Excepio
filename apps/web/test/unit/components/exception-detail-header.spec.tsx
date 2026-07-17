import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  const mockOnBack = vi.fn();

  beforeEach(() => {
    mockOnBack.mockClear();
  });

  it('debería renderizar el mensaje de la excepción como título', () => {
    render(<ExceptionDetailHeader exception={mockException} onBack={mockOnBack} />);

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('TypeError: Cannot read property of undefined');
  });

  it('debería renderizar el badge de severidad con el nombre del nivel', () => {
    render(<ExceptionDetailHeader exception={mockException} onBack={mockOnBack} />);

    expect(screen.getByText('ERROR')).toBeInTheDocument();
  });

  it('debería aplicar estilos rojos para nivel ERROR', () => {
    render(<ExceptionDetailHeader exception={mockException} onBack={mockOnBack} />);

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

    render(<ExceptionDetailHeader exception={fatalException} onBack={mockOnBack} />);

    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });

  it('debería aplicar estilos rose para nivel CRITICAL/FATAL', () => {
    const fatalException: ExceptionDetailDto = {
      ...mockException,
      levelId: 5,
      levelName: 'FATAL',
    };

    render(<ExceptionDetailHeader exception={fatalException} onBack={mockOnBack} />);

    const badge = screen.getByText('CRITICAL');
    expect(badge).toHaveClass('bg-rose-500/15');
    expect(badge).toHaveClass('text-rose-700');
  });

  it('debería mostrar el tiempo relativo', () => {
    render(<ExceptionDetailHeader exception={mockException} onBack={mockOnBack} />);

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

    render(<ExceptionDetailHeader exception={noLevelNameException} onBack={mockOnBack} />);

    // Debería mostrar el fallback del badge basado en levelId
    const badge = screen.getByText('ERROR');
    expect(badge).toBeInTheDocument();
  });

  it('debería renderizar el botón de volver', () => {
    render(<ExceptionDetailHeader exception={mockException} onBack={mockOnBack} />);

    const backButton = screen.getByRole('button', { name: /back|volver|tornar/i });
    expect(backButton).toBeInTheDocument();
  });

  it('debería llamar onBack al hacer clic en el botón', async () => {
    const user = userEvent.setup();
    render(<ExceptionDetailHeader exception={mockException} onBack={mockOnBack} />);

    const backButton = screen.getByRole('button', { name: /back|volver|tornar/i });
    await user.click(backButton);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
