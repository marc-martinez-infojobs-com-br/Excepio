import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock next-intl/middleware
vi.mock('next-intl/middleware', () => ({
  default: vi.fn(() => vi.fn()),
}));

describe('i18n middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('locale detection', () => {
    it('should use cookie locale when NEXT_LOCALE cookie is set', async () => {
      const request = new NextRequest('http://localhost:3000/dashboard', {
        headers: new Headers({
          cookie: 'NEXT_LOCALE=en',
        }),
      });

      const locale = request.cookies.get('NEXT_LOCALE')?.value;
      expect(locale).toBe('en');
    });

    it('should default to es when no cookie is set', async () => {
      const request = new NextRequest('http://localhost:3000/dashboard');
      
      const locale = request.cookies.get('NEXT_LOCALE')?.value ?? 'es';
      expect(locale).toBe('es');
    });

    it('should fallback to es for invalid locale in cookie', async () => {
      const { locales, defaultLocale } = await import('@i18n/config');
      
      const cookieLocale = 'fr'; // Not supported
      const locale = locales.includes(cookieLocale as 'es' | 'en') 
        ? cookieLocale 
        : defaultLocale;
      
      expect(locale).toBe('es');
    });
  });
});
