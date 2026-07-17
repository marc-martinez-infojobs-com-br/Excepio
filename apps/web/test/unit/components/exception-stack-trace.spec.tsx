import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExceptionStackTrace } from '@components/exceptions/exception-stack-trace';

// Mock de next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'sections.stackTrace': 'Stack Trace',
      'fields.noStackTrace': 'No stack trace',
      'actions.copy': 'Copy',
    };
    return translations[key] || key;
  }),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({ resolvedTheme: 'light' })),
}));

describe('ExceptionStackTrace', () => {
  const mockStackTrace = `Error: Cannot read property 'foo' of undefined
    at Object.method (file.ts:42:10)
    at processTicksAndRejections (internal/process/task_queues.js:95:5)
    at async main (index.ts:10:3)`;

  it('debería renderizar el título de la sección', () => {
    render(<ExceptionStackTrace stackTrace={mockStackTrace} />);

    expect(screen.getByText('Stack Trace')).toBeInTheDocument();
  });

  it('debería renderizar el stackTrace en un bloque de código', () => {
    render(<ExceptionStackTrace stackTrace={mockStackTrace} />);

    const codeBlock = screen.getByRole('code');
    expect(codeBlock).toBeInTheDocument();
    expect(codeBlock).toHaveTextContent("Cannot read property 'foo' of undefined");
    expect(codeBlock).toHaveTextContent('file.ts:42:10');
  });

  it('debería aplicar estilos de editor de código (fondo claro en light, fuente mono)', () => {
    render(<ExceptionStackTrace stackTrace={mockStackTrace} />);

    const preBlock = screen.getByRole('code').closest('pre');
    expect(preBlock).toHaveClass('bg-zinc-100');
    expect(preBlock).toHaveClass('font-mono');
  });

  it('debería mostrar mensaje cuando no hay stackTrace (null)', () => {
    render(<ExceptionStackTrace stackTrace={null} />);

    expect(screen.getByText(/no stack trace/i)).toBeInTheDocument();
  });

  it('debería mostrar mensaje cuando no hay stackTrace (undefined)', () => {
    render(<ExceptionStackTrace stackTrace={undefined} />);

    expect(screen.getByText(/no stack trace/i)).toBeInTheDocument();
  });

  it('debería mostrar mensaje cuando stackTrace está vacío', () => {
    render(<ExceptionStackTrace stackTrace="" />);

    expect(screen.getByText(/no stack trace/i)).toBeInTheDocument();
  });

  it('debería preservar saltos de línea en el stackTrace', () => {
    render(<ExceptionStackTrace stackTrace={mockStackTrace} />);

    const codeBlock = screen.getByRole('code');
    // Verificar que el contenido tiene múltiples líneas
    expect(codeBlock.textContent).toContain('at Object.method');
    expect(codeBlock.textContent).toContain('at async main');
  });
});
