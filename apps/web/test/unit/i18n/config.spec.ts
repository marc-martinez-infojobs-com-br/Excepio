import { describe, it, expect } from 'vitest';
import { locales, defaultLocale, type Locale } from '@/i18n/config';

describe('i18n config', () => {
  describe('locales', () => {
    it('should include Spanish (es)', () => {
      expect(locales).toContain('es');
    });

    it('should include English (en)', () => {
      expect(locales).toContain('en');
    });

    it('should have exactly 2 supported locales', () => {
      expect(locales).toHaveLength(2);
    });
  });

  describe('defaultLocale', () => {
    it('should be Spanish (es)', () => {
      expect(defaultLocale).toBe('es');
    });

    it('should be included in locales array', () => {
      expect(locales).toContain(defaultLocale);
    });
  });

  describe('Locale type', () => {
    it('should accept valid locale values', () => {
      const esLocale: Locale = 'es';
      const enLocale: Locale = 'en';
      
      expect(esLocale).toBe('es');
      expect(enLocale).toBe('en');
    });
  });
});
