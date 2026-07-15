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

    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('should show flags for each language', async () => {
    const user = userEvent.setup();
    render(<LanguageSelector />);

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('🇪🇸')).toBeInTheDocument();
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
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
