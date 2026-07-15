import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getRequestConfig: vi.fn((callback) => callback),
}));

// Mock the cookies function
const mockCookieStore = {
  get: vi.fn(),
};

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => mockCookieStore),
}));

describe('i18n request config', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getRequestConfig', () => {
    it('should return Spanish messages when locale cookie is es', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'es' });
      
      const { default: getConfig } = await import('@i18n/request');
      const config = await getConfig({ requestLocale: Promise.resolve('es') });
      
      expect(config.locale).toBe('es');
      expect(config.messages).toBeDefined();
    });

    it('should return English messages when locale cookie is en', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'en' });
      
      // Reset module cache to re-import with new mock
      vi.resetModules();
      vi.mock('next-intl/server', () => ({
        getRequestConfig: vi.fn((callback) => callback),
      }));
      vi.mock('next/headers', () => ({
        cookies: vi.fn(() => mockCookieStore),
      }));
      
      const { default: getConfig } = await import('@i18n/request');
      const config = await getConfig({ requestLocale: Promise.resolve('en') });
      
      expect(config.locale).toBe('en');
      expect(config.messages).toBeDefined();
    });

    it('should fallback to default locale (es) when no cookie is set', async () => {
      mockCookieStore.get.mockReturnValue(undefined);
      
      vi.resetModules();
      vi.mock('next-intl/server', () => ({
        getRequestConfig: vi.fn((callback) => callback),
      }));
      vi.mock('next/headers', () => ({
        cookies: vi.fn(() => mockCookieStore),
      }));
      
      const { default: getConfig } = await import('@i18n/request');
      const config = await getConfig({ requestLocale: Promise.resolve(undefined) });
      
      expect(config.locale).toBe('es');
      expect(config.messages).toBeDefined();
    });

    it('should fallback to default locale when invalid locale is provided', async () => {
      mockCookieStore.get.mockReturnValue({ value: 'fr' }); // French not supported
      
      vi.resetModules();
      vi.mock('next-intl/server', () => ({
        getRequestConfig: vi.fn((callback) => callback),
      }));
      vi.mock('next/headers', () => ({
        cookies: vi.fn(() => mockCookieStore),
      }));
      
      const { default: getConfig } = await import('@i18n/request');
      const config = await getConfig({ requestLocale: Promise.resolve('fr') });
      
      expect(config.locale).toBe('es');
    });
  });
});
