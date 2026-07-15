import { describe, it, expect } from 'vitest';
import esMessages from '../../../messages/es.json';
import enMessages from '../../../messages/en.json';
import caMessages from '../../../messages/ca.json';

/**
 * Recursively extracts all keys from a nested object
 * Returns keys in dot notation (e.g., "common.buttons.cancel")
 */
function extractKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...extractKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys.sort();
}

describe('i18n messages', () => {
  const esKeys = extractKeys(esMessages);
  const enKeys = extractKeys(enMessages);
  const caKeys = extractKeys(caMessages);

  describe('structure consistency', () => {
    it('should have the same number of keys in all languages', () => {
      expect(esKeys.length).toBe(enKeys.length);
      expect(esKeys.length).toBe(caKeys.length);
    });

    it('should have all Spanish keys present in English', () => {
      const missingInEn = esKeys.filter((key) => !enKeys.includes(key));
      expect(missingInEn).toEqual([]);
    });

    it('should have all English keys present in Spanish', () => {
      const missingInEs = enKeys.filter((key) => !esKeys.includes(key));
      expect(missingInEs).toEqual([]);
    });

    it('should have all Spanish keys present in Catalan', () => {
      const missingInCa = esKeys.filter((key) => !caKeys.includes(key));
      expect(missingInCa).toEqual([]);
    });

    it('should have all Catalan keys present in Spanish', () => {
      const missingInEs = caKeys.filter((key) => !esKeys.includes(key));
      expect(missingInEs).toEqual([]);
    });
  });

  describe('content validation', () => {
    it('should not have empty string values in Spanish', () => {
      const emptyKeys = esKeys.filter((key) => {
        const value = key.split('.').reduce((obj: unknown, k) => {
          return (obj as Record<string, unknown>)?.[k];
        }, esMessages);
        return value === '';
      });
      expect(emptyKeys).toEqual([]);
    });

    it('should not have empty string values in English', () => {
      const emptyKeys = enKeys.filter((key) => {
        const value = key.split('.').reduce((obj: unknown, k) => {
          return (obj as Record<string, unknown>)?.[k];
        }, enMessages);
        return value === '';
      });
      expect(emptyKeys).toEqual([]);
    });

    it('should not have empty string values in Catalan', () => {
      const emptyKeys = caKeys.filter((key) => {
        const value = key.split('.').reduce((obj: unknown, k) => {
          return (obj as Record<string, unknown>)?.[k];
        }, caMessages);
        return value === '';
      });
      expect(emptyKeys).toEqual([]);
    });
  });

  describe('required namespaces', () => {
    const requiredNamespaces = [
      'common',
      'auth',
      'exceptions',
      'dashboard',
    ];

    it.each(requiredNamespaces)('should have "%s" namespace in Spanish', (namespace) => {
      expect(esMessages).toHaveProperty(namespace);
    });

    it.each(requiredNamespaces)('should have "%s" namespace in English', (namespace) => {
      expect(enMessages).toHaveProperty(namespace);
    });

    it.each(requiredNamespaces)('should have "%s" namespace in Catalan', (namespace) => {
      expect(caMessages).toHaveProperty(namespace);
    });
  });
});
