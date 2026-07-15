import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSelector } from '@/components/language-selector';

// Mock de next-intl
vi.mock('next-intl', () => ({
  useLocale: vi.fn(() => 'es'),
  useTranslations: vi.fn(() => (key: string) => `layout.${key}`),
}));

// Mock de document.cookie
const mockReload = vi.fn();
Object.defineProperty(window, 'location', {
  value: { reload: mockReload },
  writable: true,
});

describe('LanguageSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie = '';
  });

  it('should render the globe icon button', () => {
    render(<LanguageSelector />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'layout.changeLanguage');
  });

  it('should show dropdown with language options when clicked', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Català')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('should render SVG flag icons for each language', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    await user.click(screen.getByRole('button'));

    // Verificar que hay SVGs renderizados (iconos de banderas)
    const svgs = document.querySelectorAll('svg[aria-hidden="true"]');
    // Debe haber al menos 3 SVGs de banderas + 1 del icono Globe
    expect(svgs.length).toBeGreaterThanOrEqual(4);
  });

  it('should show checkmark for current locale', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    await user.click(screen.getByRole('button'));

    // El español debería tener el checkmark (es el locale actual mockeado)
    const spanishItem = screen.getByText('Español').closest('[role="menuitem"]');
    expect(spanishItem).toHaveClass('bg-accent');
  });

  it('should set cookie and reload when changing language', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('English'));

    // Verificar que se estableció la cookie
    expect(document.cookie).toContain('NEXT_LOCALE=en');
    // Verificar que se recargó la página
    expect(mockReload).toHaveBeenCalled();
  });
});
