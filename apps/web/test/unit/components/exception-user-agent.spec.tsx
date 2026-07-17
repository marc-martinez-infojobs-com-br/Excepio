import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExceptionUserAgent } from '@components/exceptions/exception-user-agent';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: vi.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'sections.userAgent': 'User Agent',
      'userAgent.browser': 'Browser',
      'userAgent.os': 'Operating System',
      'userAgent.device': 'Device',
      'userAgent.raw': 'Raw',
      'fields.notAvailable': 'Not available',
      'actions.copy': 'Copy',
    };
    return translations[key] || key;
  }),
}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: vi.fn(() => ({ resolvedTheme: 'light' })),
}));

describe('ExceptionUserAgent', () => {
  it('debería renderizar el título de la sección', () => {
    render(<ExceptionUserAgent userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" />);

    expect(screen.getByText('User Agent')).toBeInTheDocument();
  });

  it('debería mostrar las etiquetas de browser, OS y device', () => {
    render(<ExceptionUserAgent userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" />);

    expect(screen.getByText('Browser')).toBeInTheDocument();
    expect(screen.getByText('Operating System')).toBeInTheDocument();
    expect(screen.getByText('Device')).toBeInTheDocument();
  });

  it('debería parsear Chrome en Windows', () => {
    render(<ExceptionUserAgent userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" />);

    expect(screen.getByText(/Chrome 120/)).toBeInTheDocument();
    expect(screen.getByText(/Windows 10/)).toBeInTheDocument();
    expect(screen.getByText('Desktop')).toBeInTheDocument();
  });

  it('debería parsear Firefox en Windows', () => {
    render(<ExceptionUserAgent userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0" />);

    expect(screen.getByText(/Firefox 121/)).toBeInTheDocument();
  });

  it('debería parsear Safari en macOS', () => {
    render(<ExceptionUserAgent userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15" />);

    expect(screen.getByText(/Safari 17/)).toBeInTheDocument();
    expect(screen.getByText(/macOS 10\.15/)).toBeInTheDocument();
  });

  it('debería parsear iPhone', () => {
    render(<ExceptionUserAgent userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" />);

    expect(screen.getByText('iPhone')).toBeInTheDocument();
    expect(screen.getByText(/iOS 17\.0/)).toBeInTheDocument();
  });

  it('debería mostrar el user agent raw', () => {
    const rawUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0";
    render(<ExceptionUserAgent userAgent={rawUserAgent} />);

    expect(screen.getByText('Raw')).toBeInTheDocument();
    expect(screen.getByText(rawUserAgent)).toBeInTheDocument();
  });

  it('debería mostrar "Not available" cuando userAgent es null', () => {
    render(<ExceptionUserAgent userAgent={null} />);

    expect(screen.getByText('Not available')).toBeInTheDocument();
  });

  it('debería mostrar "Not available" cuando userAgent es undefined', () => {
    render(<ExceptionUserAgent userAgent={undefined} />);

    expect(screen.getByText('Not available')).toBeInTheDocument();
  });

  it('debería tener botón de copiar', () => {
    render(<ExceptionUserAgent userAgent="Mozilla/5.0 Test" />);

    const copyButton = screen.getByRole('button');
    expect(copyButton).toBeInTheDocument();
  });

  it('debería parsear Android mobile', () => {
    render(<ExceptionUserAgent userAgent="Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36" />);

    // Android aparece en OS y en el raw, buscamos el que tiene versión
    const androidElements = screen.getAllByText(/Android/);
    expect(androidElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/Mobile \(Android\)/)).toBeInTheDocument();
  });

  it('debería parsear Linux desktop', () => {
    render(<ExceptionUserAgent userAgent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" />);

    // Linux sin versión, solo muestra "Linux"
    expect(screen.getByText('Linux')).toBeInTheDocument();
    expect(screen.getByText('Desktop')).toBeInTheDocument();
  });
});
