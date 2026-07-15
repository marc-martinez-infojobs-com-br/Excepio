import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock para next-intl en tests que no necesitan traducciones específicas
vi.mock('next-intl', async () => {
  const actual = await vi.importActual('next-intl');
  return {
    ...actual,
    useTranslations: (namespace: string) => {
      return (key: string, values?: Record<string, unknown>) => {
        // Devuelve la key completa para debugging o un valor de fallback
        if (values) {
          let result = `${namespace}.${key}`;
          Object.entries(values).forEach(([k, v]) => {
            result = result.replace(`{${k}}`, String(v));
          });
          return result;
        }
        return `${namespace}.${key}`;
      };
    },
  };
});
