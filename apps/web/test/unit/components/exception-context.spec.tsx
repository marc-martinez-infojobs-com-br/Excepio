import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExceptionContext } from '@components/exceptions/exception-context';
import type { ExceptionDetailDto } from '@excepio/shared';

// Mock de next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'sections.context': 'Contextual Information',
      'fields.platform': 'Platform',
      'fields.appVersion': 'Version',
      'fields.url': 'URL',
      'fields.userId': 'User',
      'fields.userAgent': 'User Agent',
      'fields.timestamp': 'Date and time',
      'fields.affectedUsers': 'Affected users',
      'fields.notAvailable': 'Not available',
    };
    return translations[key] || key;
  }),
}));

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
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  appVersion: '1.2.3',
  metadata: { browser: 'Chrome' },
  createdAt: '2024-01-15T10:30:00.000Z',
  affectedUsersCount: 5,
};

describe('ExceptionContext', () => {
  it('debería renderizar el título de la sección', () => {
    render(<ExceptionContext exception={mockException} />);

    expect(screen.getByText('Contextual Information')).toBeInTheDocument();
  });

  it('debería mostrar el nombre de la plataforma', () => {
    render(<ExceptionContext exception={mockException} />);

    expect(screen.getByText('Platform')).toBeInTheDocument();
    expect(screen.getByText('Web App')).toBeInTheDocument();
  });

  it('debería mostrar la versión de la app', () => {
    render(<ExceptionContext exception={mockException} />);

    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('1.2.3')).toBeInTheDocument();
  });

  it('debería mostrar la URL', () => {
    render(<ExceptionContext exception={mockException} />);

    expect(screen.getByText('URL')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/page')).toBeInTheDocument();
  });

  it('debería mostrar el userId', () => {
    render(<ExceptionContext exception={mockException} />);

    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('user-456')).toBeInTheDocument();
  });

  it('debería mostrar el userAgent', () => {
    render(<ExceptionContext exception={mockException} />);

    expect(screen.getByText('User Agent')).toBeInTheDocument();
    expect(screen.getByText(/Mozilla\/5.0/)).toBeInTheDocument();
  });

  it('debería mostrar la fecha y hora', () => {
    render(<ExceptionContext exception={mockException} />);

    expect(screen.getByText('Date and time')).toBeInTheDocument();
    // La fecha se formatea, verificamos que aparece algo con 2024
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it('debería mostrar el contador de usuarios afectados', () => {
    render(<ExceptionContext exception={mockException} />);

    expect(screen.getByText('Affected users')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('debería mostrar "Not available" para campos nulos', () => {
    const exceptionWithNulls: ExceptionDetailDto = {
      ...mockException,
      url: null,
      userId: null,
      userAgent: null,
      appVersion: null,
    };

    render(<ExceptionContext exception={exceptionWithNulls} />);

    const notAvailableElements = screen.getAllByText('Not available');
    expect(notAvailableElements.length).toBeGreaterThanOrEqual(4);
  });

  it('debería mostrar 0 usuarios afectados correctamente', () => {
    const exceptionNoUsers: ExceptionDetailDto = {
      ...mockException,
      affectedUsersCount: 0,
    };

    render(<ExceptionContext exception={exceptionNoUsers} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
