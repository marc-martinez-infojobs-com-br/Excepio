import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExceptionMetadata } from '@components/exceptions/exception-metadata';

// Mock de next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'sections.metadata': 'Metadata',
      'fields.noMetadata': 'No metadata',
    };
    return translations[key] || key;
  }),
}));

describe('ExceptionMetadata', () => {
  const mockMetadata = {
    browser: 'Chrome',
    os: 'macOS',
    environment: 'production',
    userId: 12345,
  };

  it('debería renderizar el título de la sección', () => {
    render(<ExceptionMetadata metadata={mockMetadata} />);

    expect(screen.getByText('Metadata')).toBeInTheDocument();
  });

  it('debería renderizar el JSON formateado en un bloque de código', () => {
    render(<ExceptionMetadata metadata={mockMetadata} />);

    const codeBlock = screen.getByRole('code');
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock).toHaveTextContent('"browser": "Chrome"');
    expect(codeBlock).toHaveTextContent('"os": "macOS"');
  });

  it('debería aplicar estilos de editor de código (fondo oscuro, fuente mono)', () => {
    render(<ExceptionMetadata metadata={mockMetadata} />);

    const preBlock = screen.getByRole('code').closest('pre');
    expect(preBlock).toHaveClass('bg-zinc-900');
    expect(preBlock).toHaveClass('font-mono');
  });

  it('debería mostrar mensaje cuando no hay metadata (null)', () => {
    render(<ExceptionMetadata metadata={null} />);

    expect(screen.getByText(/no metadata/i)).toBeInTheDocument();
  });

  it('debería mostrar mensaje cuando no hay metadata (undefined)', () => {
    render(<ExceptionMetadata metadata={undefined} />);

    expect(screen.getByText(/no metadata/i)).toBeInTheDocument();
  });

  it('debería mostrar mensaje cuando metadata es objeto vacío', () => {
    render(<ExceptionMetadata metadata={{}} />);

    expect(screen.getByText(/no metadata/i)).toBeInTheDocument();
  });

  it('debería formatear correctamente valores numéricos', () => {
    render(<ExceptionMetadata metadata={mockMetadata} />);

    const codeBlock = screen.getByRole('code');
    expect(codeBlock).toHaveTextContent('"userId": 12345');
  });

  it('debería manejar valores anidados', () => {
    const nestedMetadata = {
      user: {
        id: 1,
        name: 'John',
      },
      tags: ['error', 'critical'],
    };

    render(<ExceptionMetadata metadata={nestedMetadata} />);

    const codeBlock = screen.getByRole('code');
    expect(codeBlock).toHaveTextContent('"user"');
    expect(codeBlock).toHaveTextContent('"name": "John"');
    expect(codeBlock).toHaveTextContent('"tags"');
  });
});
